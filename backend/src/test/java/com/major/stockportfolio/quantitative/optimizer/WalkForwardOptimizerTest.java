package com.major.stockportfolio.quantitative.optimizer;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

import com.major.stockportfolio.quantitative.config.StrategyConfig;
import com.major.stockportfolio.quantitative.engine.BacktestEngine;
import com.major.stockportfolio.quantitative.report.TradingProfitCalculator;
import org.junit.jupiter.api.Test;
import org.ta4j.core.BarSeries;
import org.ta4j.core.BaseBarSeriesBuilder;
import org.ta4j.core.BaseStrategy;
import org.ta4j.core.Rule;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class WalkForwardOptimizerTest {

    private static final StrategyConfig CONFIG =
            new StrategyConfig(9, 20, 14, 60.0, 40.0);

    @Test
    void startsEachWindowWithFreshCapitalAndMarksOpenSharesAtFinalClose() {
        BarSeries series = createSeries();
        ParameterOptimizer parameterOptimizer = configuredOptimizer();
        WalkForwardOptimizer optimizer = new WalkForwardOptimizer(
                parameterOptimizer,
                new BacktestEngine(),
                new TradingProfitCalculator(),
                3,
                3,
                3
        );

        List<WalkForwardOptimizer.WalkForwardResult> results =
                optimizer.optimize(series, 1000.0);

        assertEquals(2, results.size());
        assertEquals(200.0, results.get(0).getTestingProfit(), 1e-8);
        assertEquals(100.0, results.get(1).getTestingProfit(), 1e-8);
        assertEquals(0, results.get(0).getCompletedTrades());
        assertEquals(0, results.get(1).getCompletedTrades());
        assertEquals(300.0, optimizer.calculateTotalProfit(results), 1e-8);
        verify(parameterOptimizer, times(2))
                .optimize(any(BarSeries.class), eq(1000.0));
    }

    @Test
    void skipsEntriesWhenTestingWindowCannotAffordOneShare() {
        BarSeries series = createSeries();
        WalkForwardOptimizer optimizer = new WalkForwardOptimizer(
                configuredOptimizer(),
                new BacktestEngine(),
                new TradingProfitCalculator(),
                3,
                3,
                3
        );

        List<WalkForwardOptimizer.WalkForwardResult> results =
                optimizer.optimize(series, 99.0);

        assertEquals(2, results.size());
        assertEquals(0.0, results.get(0).getTestingProfit());
        assertEquals(0.0, results.get(1).getTestingProfit());
        assertEquals(0, results.get(0).getCompletedTrades());
        assertEquals(0, results.get(1).getCompletedTrades());
        assertEquals(0.0, optimizer.calculateTotalProfit(results));
    }

    private ParameterOptimizer configuredOptimizer() {
        ParameterOptimizer optimizer = mock(ParameterOptimizer.class);
        when(optimizer.optimize(any(BarSeries.class), anyDouble()))
                .thenReturn(CONFIG);
        when(optimizer.createStrategy(any(BarSeries.class), eq(CONFIG)))
                .thenAnswer(invocation -> {
                    BarSeries evaluationSeries = invocation.getArgument(0);
                    int signalIndex = evaluationSeries.getBeginIndex() + 2;
                    Rule entryRule = (index, record) -> index == signalIndex;
                    Rule exitRule = (index, record) -> false;
                    return new BaseStrategy(entryRule, exitRule);
                });
        return optimizer;
    }

    private BarSeries createSeries() {
        BarSeries series = new BaseBarSeriesBuilder()
                .withName("WALK_FORWARD_TEST")
                .build();
        double[] opens = {
                100.0, 100.0, 80.0,
                100.0, 110.0, 120.0,
                200.0, 210.0, 220.0
        };
        double[] closes = {
                100.0, 100.0, 80.0,
                90.0, 100.0, 120.0,
                200.0, 210.0, 220.0
        };

        for (int i = 0; i < opens.length; i++) {
            series.barBuilder()
                    .timePeriod(Duration.ofDays(1))
                    .endTime(Instant.parse("2025-02-01T00:00:00Z")
                            .plus(Duration.ofDays(i + 1)))
                    .openPrice(opens[i])
                    .highPrice(Math.max(opens[i], closes[i]))
                    .lowPrice(Math.min(opens[i], closes[i]))
                    .closePrice(closes[i])
                    .volume(1000)
                    .add();
        }
        return series;
    }
}
