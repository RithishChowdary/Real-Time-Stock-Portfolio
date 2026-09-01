package com.major.stockportfolio.quantitative.service.impl;

import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.ta4j.core.BarSeries;
import org.ta4j.core.Strategy;
import org.ta4j.core.TradingRecord;

import com.major.stockportfolio.quantitative.config.StrategyConfig;
import com.major.stockportfolio.quantitative.contracts.MarketDataLoader;
import com.major.stockportfolio.quantitative.dto.api.BacktestRequest;
import com.major.stockportfolio.quantitative.dto.api.BacktestResponse;
import com.major.stockportfolio.quantitative.dto.api.WalkForwardBacktestResponse;
import com.major.stockportfolio.quantitative.dto.api.WalkForwardWindowResponse;
import com.major.stockportfolio.quantitative.engine.BacktestEngine;
import com.major.stockportfolio.quantitative.indicator.IndicatorRegistry;
import com.major.stockportfolio.quantitative.optimizer.ParameterOptimizer;
import com.major.stockportfolio.quantitative.optimizer.WalkForwardOptimizer;
import com.major.stockportfolio.quantitative.report.PerformanceMetrics;
import com.major.stockportfolio.quantitative.report.PerformanceMetricsCalculator;
import com.major.stockportfolio.quantitative.report.TradingProfitCalculator;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class BacktestApiService {

    private final MarketDataLoader marketDataLoader;

    private final BacktestEngine backtestEngine;

    private final PerformanceMetricsCalculator metricsCalculator;

    private final ParameterOptimizer parameterOptimizer;

    private final TradingProfitCalculator tradingProfitCalculator;

    private final WalkForwardOptimizer walkForwardOptimizer;

    private final StrategyService strategyService;

    public BacktestApiService(
            MarketDataLoader marketDataLoader,
            BacktestEngine backtestEngine,
            PerformanceMetricsCalculator metricsCalculator,
            IndicatorRegistry indicatorRegistry,
            ParameterOptimizer parameterOptimizer,
            TradingProfitCalculator tradingProfitCalculator,
            StrategyService strategyService) {

        this.marketDataLoader =
                Objects.requireNonNull(
                        marketDataLoader,
                        "MarketDataLoader must not be null"
                );

        this.strategyService =
                Objects.requireNonNull(
                        strategyService,
                        "StrategyService must not be null"
                );

        this.backtestEngine =
                Objects.requireNonNull(
                        backtestEngine,
                        "BacktestEngine must not be null"
                );

        this.metricsCalculator =
                Objects.requireNonNull(
                        metricsCalculator,
                        "PerformanceMetricsCalculator must not be null"
                );

        Objects.requireNonNull(
                indicatorRegistry,
                "IndicatorRegistry must not be null"
        );

        this.parameterOptimizer =
                Objects.requireNonNull(
                        parameterOptimizer,
                        "ParameterOptimizer must not be null"
                );

        this.tradingProfitCalculator =
                Objects.requireNonNull(
                        tradingProfitCalculator,
                        "TradingProfitCalculator must not be null"
                );

        /*
         * Walk-forward configuration:
         *
         * Training window = 50 bars
         * Testing window  = 25 bars
         * Step size        = 25 bars
         *
         * Alpha Vantage compact data provides
         * approximately 100 daily bars.
         */
        this.walkForwardOptimizer =
                new WalkForwardOptimizer(
                        this.parameterOptimizer,
                        this.backtestEngine,
                        this.tradingProfitCalculator,
                        50,
                        25,
                        25
                );
    }

    /**
     * Executes a normal API backtest.
     *
     * <p>
     * Historical market data is loaded from the API.
     * The ParameterOptimizer searches multiple EMA + RSI
     * configurations and selects the configuration with
     * the highest historical profit.
     * </p>
     *
     * @param request backtest request containing the symbol
     * @return backtest response containing performance metrics
     */
    public BacktestResponse execute(
            BacktestRequest request) {

        Objects.requireNonNull(
                request,
                "BacktestRequest must not be null"
        );

        if (request.getSymbol() == null
                || request.getSymbol().isBlank()) {

            throw new IllegalArgumentException(
                    "Symbol must not be empty"
            );
        }

        String symbol =
                request.getSymbol()
                        .trim()
                        .toUpperCase();

        log.info(
                "Starting API backtest for symbol: {}",
                symbol
        );

        /*
         * 1. Load historical market data.
         */
        BarSeries series =
                marketDataLoader.loadSeries(
                        symbol
                );

        /*
         * 2. Optimize strategy parameters.
         */
        StrategyConfig bestConfig =
                parameterOptimizer.optimize(
                        series
                );

        log.info(
                "Best strategy configuration for {}: "
                        + "EMA {}/{} | RSI {} | "
                        + "Buy {} | Sell {}",
                symbol,
                bestConfig.getFastEmaPeriod(),
                bestConfig.getSlowEmaPeriod(),
                bestConfig.getRsiPeriod(),
                bestConfig.getRsiBuyThreshold(),
                bestConfig.getRsiSellThreshold()
        );

        /*
         * 3. Create strategy using optimized configuration.
         */
        com.major.stockportfolio.quantitative.model.StrategyType strategyType =
                com.major.stockportfolio.quantitative.model.StrategyType.EMA_RSI;

        if (request.getStrategy() != null && !request.getStrategy().isBlank()) {
            try {
                strategyType = com.major.stockportfolio.quantitative.model.StrategyType.valueOf(
                        request.getStrategy().trim().toUpperCase()
                );
            } catch (IllegalArgumentException e) {
                log.warn("Unknown strategy type: {}. Defaulting to EMA_RSI", request.getStrategy());
            }
        }

        Strategy strategy;
        if (strategyType == com.major.stockportfolio.quantitative.model.StrategyType.EMA_CROSSOVER) {
            strategy = strategyService.getStrategy(
                    com.major.stockportfolio.quantitative.model.StrategyType.EMA_CROSSOVER,
                    series,
                    bestConfig
            );
        } else {
            strategy = parameterOptimizer.createStrategy(
                    series,
                    bestConfig
            );
        }

        /*
         * 4. Execute backtest.
         */
        TradingRecord tradingRecord =
                backtestEngine.run(
                        series,
                        strategy
                );

        /*
         * 5. Calculate performance metrics.
         */
        PerformanceMetrics metrics =
                metricsCalculator.calculate(
                        series,
                        tradingRecord
                );

        /*
         * 6. Convert internal result into API DTO.
         */
        BacktestResponse response =
                new BacktestResponse(
                        symbol,
                        strategyType.name(),
                        metrics
                );

        log.info(
                "API backtest completed for {}. "
                        + "Trades: {}, Earnings: {}",
                symbol,
                metrics.getTotalTrades(),
                metrics.getTotalEarnings()
        );

        return response;
    }

    /**
     * Executes walk-forward optimization using market data
     * obtained from the API.
     *
     * <p>
     * For every walk-forward window:
     *
     * <ol>
     *     <li>Optimize parameters using training data.</li>
     *     <li>Create the strategy using the selected parameters.</li>
     *     <li>Evaluate the strategy on unseen testing data.</li>
     * </ol>
     *
     * @param request backtest request containing the symbol
     * @return walk-forward backtest response
     */
    public WalkForwardBacktestResponse executeWalkForward(
            BacktestRequest request) {

        Objects.requireNonNull(
                request,
                "BacktestRequest must not be null"
        );

        if (request.getSymbol() == null
                || request.getSymbol().isBlank()) {

            throw new IllegalArgumentException(
                    "Symbol must not be empty"
            );
        }

        String symbol =
                request.getSymbol()
                        .trim()
                        .toUpperCase();

        log.info(
                "Starting walk-forward API backtest for symbol: {}",
                symbol
        );

        /*
         * 1. Load historical market data.
         */
        BarSeries series =
                marketDataLoader.loadSeries(
                        symbol
                );

        /*
         * 2. Execute walk-forward optimization.
         *
         * Training window = 50
         * Testing window  = 25
         * Step size        = 25
         */
        List<WalkForwardOptimizer.WalkForwardResult>
                optimizerResults =
                walkForwardOptimizer.optimize(
                        series
                );

        /*
         * 3. Convert internal optimizer results
         *    into API DTOs.
         */
        List<WalkForwardWindowResponse> results =
                optimizerResults.stream()
                        .map(result ->
                                new WalkForwardWindowResponse(
                                        result.getWindowNumber(),

                                        result.getTrainingStart(),
                                        result.getTrainingEnd(),

                                        result.getTestingStart(),
                                        result.getTestingEnd(),

                                        result.getBestConfig()
                                                .getFastEmaPeriod(),

                                        result.getBestConfig()
                                                .getSlowEmaPeriod(),

                                        result.getBestConfig()
                                                .getRsiPeriod(),

                                        result.getBestConfig()
                                                .getRsiBuyThreshold(),

                                        result.getBestConfig()
                                                .getRsiSellThreshold(),

                                        result.getTestingProfit(),

                                        result.getCompletedTrades()
                                )
                        )
                        .toList();

        /*
         * 4. Calculate total out-of-sample profit.
         */
        double totalOutOfSampleProfit =
                walkForwardOptimizer.calculateTotalProfit(
                        optimizerResults
                );

        /*
         * 5. Build API response.
         */
        WalkForwardBacktestResponse response =
                new WalkForwardBacktestResponse(
                        symbol,
                        results.size(),
                        totalOutOfSampleProfit,
                        results
                );

        log.info(
                "Walk-forward API backtest completed for {}. "
                        + "Windows: {}, Total OOS Profit: {}",
                symbol,
                results.size(),
                String.format(
                        "%.2f",
                        totalOutOfSampleProfit
                )
        );

        return response;
    }
}