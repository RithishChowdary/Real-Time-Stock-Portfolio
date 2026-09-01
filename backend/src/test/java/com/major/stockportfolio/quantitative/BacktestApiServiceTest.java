package com.major.stockportfolio.quantitative;

import com.major.stockportfolio.quantitative.config.StrategyConfig;
import com.major.stockportfolio.quantitative.contracts.MarketDataLoader;
import com.major.stockportfolio.quantitative.dto.api.BacktestRequest;
import com.major.stockportfolio.quantitative.dto.api.BacktestResponse;
import com.major.stockportfolio.quantitative.engine.BacktestEngine;
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
        when(parameterOptimizer.optimize(series)).thenReturn(config);
        when(parameterOptimizer.createStrategy(series, config)).thenReturn(strategy);
        when(backtestEngine.run(series, strategy)).thenReturn(tradingRecord);
        when(metricsCalculator.calculate(series, tradingRecord)).thenReturn(metrics);

        BacktestResponse response = backtestApiService.execute(request);

        assertNotNull(response);
        assertEquals("TCS", response.getSymbol());
        assertEquals("EMA_RSI", response.getStrategy());
        assertNotNull(response.getPerformanceMetrics());
        assertEquals(10, response.getPerformanceMetrics().getTotalTrades());
        assertEquals(70.0, response.getPerformanceMetrics().getWinRate());
        assertEquals(12000.0, response.getPerformanceMetrics().getTotalEarnings());
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
        when(parameterOptimizer.optimize(series)).thenReturn(config);
        when(strategyService.getStrategy(StrategyType.EMA_CROSSOVER, series, config)).thenReturn(strategy);
        when(backtestEngine.run(series, strategy)).thenReturn(tradingRecord);
        when(metricsCalculator.calculate(series, tradingRecord)).thenReturn(metrics);

        BacktestResponse response = backtestApiService.execute(request);

        assertNotNull(response);
        assertEquals("INFY", response.getSymbol());
        assertEquals("EMA_CROSSOVER", response.getStrategy());
        assertEquals(4, response.getPerformanceMetrics().getTotalTrades());
        assertEquals(50.0, response.getPerformanceMetrics().getWinRate());
        verify(strategyService, times(1)).getStrategy(StrategyType.EMA_CROSSOVER, series, config);
    }

    @Test
    void testExecute_EmptySymbol() {
        BacktestRequest request = new BacktestRequest("");
        assertThrows(IllegalArgumentException.class, () -> backtestApiService.execute(request));
    }
}
