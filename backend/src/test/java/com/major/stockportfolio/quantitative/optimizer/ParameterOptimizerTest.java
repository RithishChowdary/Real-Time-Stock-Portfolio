package com.major.stockportfolio.quantitative.optimizer;

import java.time.Duration;
import java.time.Instant;

import com.major.stockportfolio.quantitative.config.StrategyConfig;
import com.major.stockportfolio.quantitative.engine.BacktestEngine;
import com.major.stockportfolio.quantitative.model.StrategyType;
import com.major.stockportfolio.quantitative.report.TradingProfitCalculator;
import com.major.stockportfolio.quantitative.service.impl.StrategyService;
import org.junit.jupiter.api.Test;
import org.ta4j.core.BarSeries;
import org.ta4j.core.BaseBarSeriesBuilder;
import org.ta4j.core.BaseStrategy;
import org.ta4j.core.Rule;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.same;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.mock;

class ParameterOptimizerTest {

    @Test
    void scoresCandidatesUsingSizedAccountEarningsAndRequestedCapital() {
        BarSeries series = createSeries();
        StrategyService strategyService = mock(StrategyService.class);
        BacktestEngine backtestEngine = spy(new BacktestEngine());
        when(strategyService.getStrategy(
                eq(StrategyType.EMA_RSI),
                same(series),
                any(StrategyConfig.class)
        )).thenAnswer(invocation -> {
            StrategyConfig config = invocation.getArgument(2);
            Rule entryRule = (index, record) -> index == 0;
            Rule exitRule = (index, record) ->
                    index == 2 && config.getRsiBuyThreshold() == 60.0;
            return new BaseStrategy(entryRule, exitRule);
        });

        ParameterOptimizer optimizer = new ParameterOptimizer(
                strategyService,
                backtestEngine,
                new TradingProfitCalculator()
        );

        StrategyConfig bestConfig = optimizer.optimize(series, 1000.0);

        assertEquals(9, bestConfig.getFastEmaPeriod());
        assertEquals(20, bestConfig.getSlowEmaPeriod());
        assertEquals(60.0, bestConfig.getRsiBuyThreshold());
        assertEquals(40.0, bestConfig.getRsiSellThreshold());
        verify(backtestEngine, times(72))
                .runWithAccount(same(series), any(), eq(1000.0));
    }

    private BarSeries createSeries() {
        BarSeries series = new BaseBarSeriesBuilder()
                .withName("PARAMETER_OPTIMIZER_TEST")
                .build();
        double[] opens = {100.0, 100.0, 100.0, 150.0};
        double[] closes = {100.0, 100.0, 100.0, 90.0};

        for (int i = 0; i < opens.length; i++) {
            series.barBuilder()
                    .timePeriod(Duration.ofDays(1))
                    .endTime(Instant.parse("2025-01-01T00:00:00Z")
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
