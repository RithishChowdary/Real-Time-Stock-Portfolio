package com.major.stockportfolio.quantitative;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

import com.major.stockportfolio.quantitative.config.StrategyConfig;
import com.major.stockportfolio.quantitative.contracts.MarketDataLoader;
import com.major.stockportfolio.quantitative.dto.api.BacktestRequest;
import com.major.stockportfolio.quantitative.dto.api.BacktestResponse;
import com.major.stockportfolio.quantitative.dto.api.WalkForwardBacktestResponse;
import com.major.stockportfolio.quantitative.engine.BacktestEngine;
import com.major.stockportfolio.quantitative.engine.BacktestResult;
import com.major.stockportfolio.quantitative.indicator.IndicatorRegistry;
import com.major.stockportfolio.quantitative.model.StrategyType;
import com.major.stockportfolio.quantitative.optimizer.ParameterOptimizer;
import com.major.stockportfolio.quantitative.report.PerformanceMetrics;
import com.major.stockportfolio.quantitative.report.PerformanceMetricsCalculator;
import com.major.stockportfolio.quantitative.report.TradingProfitCalculator;
import com.major.stockportfolio.quantitative.service.impl.BacktestApiService;
import com.major.stockportfolio.quantitative.service.impl.StrategyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.ta4j.core.BarSeries;
import org.ta4j.core.BaseBarSeriesBuilder;
import org.ta4j.core.BaseTradingRecord;
import org.ta4j.core.Strategy;
import org.ta4j.core.TradingRecord;
import org.ta4j.core.rules.BooleanRule;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BacktestApiServiceTest {

    @Mock
    private MarketDataLoader marketDataLoader;

    @Mock
    private BacktestEngine backtestEngine;

    @Mock
    private PerformanceMetricsCalculator metricsCalculator;

    @Mock
    private IndicatorRegistry indicatorRegistry;

    @Mock
    private ParameterOptimizer parameterOptimizer;

    @Mock
    private TradingProfitCalculator tradingProfitCalculator;

    @Mock
    private StrategyService strategyService;

    private BacktestApiService backtestApiService;

    @BeforeEach
    void setUp() {
        backtestApiService = new BacktestApiService(
                marketDataLoader,
                backtestEngine,
                metricsCalculator,
                indicatorRegistry,
                parameterOptimizer,
                tradingProfitCalculator,
                strategyService
        );
    }

    @Test
    void testExecute_EmaRsiSuccess() {
        BacktestRequest request = new BacktestRequest("TCS", "EMA_RSI");
        BarSeries series = new BaseBarSeriesBuilder().withName("TCS").build();
        StrategyConfig config = new StrategyConfig(9, 20, 14, 70.0, 30.0);
        Strategy strategy = new org.ta4j.core.BaseStrategy(BooleanRule.TRUE, BooleanRule.FALSE);
        TradingRecord tradingRecord = new BaseTradingRecord();
        PerformanceMetrics metrics = new PerformanceMetrics(
                10, 7, 3, 70.0, 15000.0, 3000.0, 12000.0, 1200.0, 5.5, 5.0
        );

        when(marketDataLoader.loadSeries("TCS")).thenReturn(series);
        when(parameterOptimizer.optimize(series, 100000.0)).thenReturn(config);
        when(parameterOptimizer.createStrategy(series, config)).thenReturn(strategy);
        BacktestResult backtestResult = new BacktestResult(tradingRecord, List.of());
        when(backtestEngine.runWithAccount(series, strategy, 100000.0)).thenReturn(backtestResult);
        when(metricsCalculator.calculate(backtestResult, 100000.0)).thenReturn(metrics);

        BacktestResponse response = backtestApiService.execute(request);

        assertNotNull(response);
        assertEquals("TCS", response.getSymbol());
        assertEquals("EMA_RSI", response.getStrategy());
        assertNotNull(response.getPerformanceMetrics());
        assertEquals(10, response.getPerformanceMetrics().getTotalTrades());
        assertEquals(70.0, response.getPerformanceMetrics().getWinRate());
        assertEquals(12000.0, response.getPerformanceMetrics().getTotalEarnings());
        assertEquals(100000.0, response.getPerformanceMetrics().getInitialCapital());
        assertEquals(112000.0, response.getPerformanceMetrics().getFinalPortfolioValue());
        assertEquals(12.0, response.getPerformanceMetrics().getReturnOnInvestment());
    }

    @Test
    void testExecute_EmaCrossoverSuccess() {
        BacktestRequest request = new BacktestRequest("INFY", "EMA_CROSSOVER");
        BarSeries series = new BaseBarSeriesBuilder().withName("INFY").build();
        StrategyConfig config = new StrategyConfig(9, 20, 14, 70.0, 30.0);
        Strategy strategy = new org.ta4j.core.BaseStrategy(BooleanRule.TRUE, BooleanRule.FALSE);
        TradingRecord tradingRecord = new BaseTradingRecord();
        PerformanceMetrics metrics = new PerformanceMetrics(
                4, 2, 2, 50.0, 6000.0, 4000.0, 2000.0, 500.0, 8.2, 1.5
        );

        when(marketDataLoader.loadSeries("INFY")).thenReturn(series);
        when(parameterOptimizer.optimize(series, 100000.0)).thenReturn(config);
        when(strategyService.getStrategy(StrategyType.EMA_CROSSOVER, series, config)).thenReturn(strategy);
        BacktestResult backtestResult = new BacktestResult(tradingRecord, List.of());
        when(backtestEngine.runWithAccount(series, strategy, 100000.0)).thenReturn(backtestResult);
        when(metricsCalculator.calculate(backtestResult, 100000.0)).thenReturn(metrics);

        BacktestResponse response = backtestApiService.execute(request);

        assertNotNull(response);
        assertEquals("INFY", response.getSymbol());
        assertEquals("EMA_CROSSOVER", response.getStrategy());
        assertEquals(4, response.getPerformanceMetrics().getTotalTrades());
        assertEquals(50.0, response.getPerformanceMetrics().getWinRate());
        assertEquals(100000.0, response.getPerformanceMetrics().getInitialCapital());
        assertEquals(102000.0, response.getPerformanceMetrics().getFinalPortfolioValue());
        assertEquals(2.0, response.getPerformanceMetrics().getReturnOnInvestment());
        verify(strategyService, times(1)).getStrategy(StrategyType.EMA_CROSSOVER, series, config);
    }

    @Test
    void testExecute_CustomInitialCapital() {
        BacktestRequest request = new BacktestRequest("TCS", "EMA_RSI", 250000.0);
        BarSeries series = new BaseBarSeriesBuilder().withName("TCS").build();
        StrategyConfig config = new StrategyConfig(9, 20, 14, 70.0, 30.0);
        Strategy strategy = new org.ta4j.core.BaseStrategy(BooleanRule.TRUE, BooleanRule.FALSE);
        TradingRecord tradingRecord = new BaseTradingRecord();
        PerformanceMetrics metrics = new PerformanceMetrics(
                10, 7, 3, 70.0, 15000.0, 3000.0, 12000.0, 1200.0, 5.5, 5.0,
                250000.0, 262000.0, 4.8, 1200.0, 2142.86, 1000.0, 2.14, 1.25
        );

        when(marketDataLoader.loadSeries("TCS")).thenReturn(series);
        when(parameterOptimizer.optimize(series, 250000.0)).thenReturn(config);
        when(parameterOptimizer.createStrategy(series, config)).thenReturn(strategy);
        BacktestResult backtestResult = new BacktestResult(tradingRecord, List.of());
        when(backtestEngine.runWithAccount(series, strategy, 250000.0)).thenReturn(backtestResult);
        when(metricsCalculator.calculate(backtestResult, 250000.0)).thenReturn(metrics);

        BacktestResponse response = backtestApiService.execute(request);

        assertNotNull(response);
        assertEquals(250000.0, response.getPerformanceMetrics().getInitialCapital());
        assertEquals(262000.0, response.getPerformanceMetrics().getFinalPortfolioValue());
        assertEquals(4.8, response.getPerformanceMetrics().getReturnOnInvestment());
        verify(backtestEngine, times(1)).runWithAccount(series, strategy, 250000.0);
        verify(parameterOptimizer, times(1)).optimize(series, 250000.0);
    }

    @Test
    void testExecuteWalkForward_PreservesResponseFieldsAndUsesRequestedCapital() {
        BacktestRequest request = new BacktestRequest("TCS", "EMA_RSI", 250000.0);
        BarSeries series = createSeries("TCS", 75);
        StrategyConfig config = new StrategyConfig(9, 20, 14, 70.0, 30.0);
        Strategy strategy = new org.ta4j.core.BaseStrategy(BooleanRule.TRUE, BooleanRule.FALSE);
        BacktestResult backtestResult = new BacktestResult(
                new BaseTradingRecord(),
                List.of(new com.major.stockportfolio.quantitative.engine.AccountSnapshot(
                        74,
                        Instant.parse("2025-03-17T00:00:00Z"),
                        250000.0,
                        0L,
                        0.0,
                        0.0,
                        0.0,
                        0.0,
                        250000.0
                ))
        );

        when(marketDataLoader.loadSeries("TCS")).thenReturn(series);
        when(parameterOptimizer.optimize(any(BarSeries.class), eq(250000.0)))
                .thenReturn(config);
        when(parameterOptimizer.createStrategy(any(BarSeries.class), eq(config)))
                .thenReturn(strategy);
        when(backtestEngine.runWithAccount(
                any(BarSeries.class),
                eq(strategy),
                eq(250000.0),
                anyInt()
        )).thenReturn(backtestResult);
        when(tradingProfitCalculator.calculate(backtestResult, 250000.0))
                .thenReturn(125.0);

        WalkForwardBacktestResponse response =
                backtestApiService.executeWalkForward(request);

        assertEquals("TCS", response.getSymbol());
        assertEquals(1, response.getWindowsEvaluated());
        assertEquals(125.0, response.getTotalOutOfSampleProfit());
        assertEquals(125.0, response.getResults().get(0).getTestingProfit());
        assertEquals(0, response.getResults().get(0).getCompletedTrades());
        verify(parameterOptimizer, times(1))
                .optimize(any(BarSeries.class), eq(250000.0));
    }

    @Test
    void testExecute_EmptySymbol() {
        BacktestRequest request = new BacktestRequest("");
        assertThrows(IllegalArgumentException.class, () -> backtestApiService.execute(request));
    }

    private BarSeries createSeries(String name, int count) {
        BarSeries series = new BaseBarSeriesBuilder().withName(name).build();
        for (int i = 0; i < count; i++) {
            double price = 100.0 + i;
            series.barBuilder()
                    .timePeriod(Duration.ofDays(1))
                    .endTime(Instant.parse("2025-01-01T00:00:00Z")
                            .plus(Duration.ofDays(i + 1)))
                    .openPrice(price)
                    .highPrice(price)
                    .lowPrice(price)
                    .closePrice(price)
                    .volume(1000)
                    .add();
        }
        return series;
    }
}
