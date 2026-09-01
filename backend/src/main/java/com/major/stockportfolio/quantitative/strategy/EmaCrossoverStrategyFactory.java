package com.major.stockportfolio.quantitative.strategy;

import java.util.Objects;

import org.ta4j.core.BarSeries;
import org.ta4j.core.BaseStrategy;
import org.ta4j.core.Strategy;
import org.ta4j.core.indicators.averages.EMAIndicator;
import org.ta4j.core.indicators.helpers.ClosePriceIndicator;
import org.ta4j.core.rules.CrossedDownIndicatorRule;
import org.ta4j.core.rules.CrossedUpIndicatorRule;

import com.major.stockportfolio.quantitative.config.StrategyConfig;
import com.major.stockportfolio.quantitative.contracts.StrategyFactory;
import com.major.stockportfolio.quantitative.indicator.IndicatorRegistry;
import com.major.stockportfolio.quantitative.model.IndicatorType;

import lombok.RequiredArgsConstructor;

/**
 * Builds a simple EMA crossover strategy.
 *
 * <p>Entry:</p>
 * <ul>
 *     <li>Fast EMA crosses above slow EMA.</li>
 * </ul>
 *
 * <p>Exit:</p>
 * <ul>
 *     <li>Fast EMA crosses below slow EMA.</li>
 * </ul>
 *
 * <p>Only the EMA periods from StrategyConfig are used.
 * RSI configuration is ignored by this strategy.</p>
 */
@RequiredArgsConstructor
public class EmaCrossoverStrategyFactory
        implements StrategyFactory {

    private final IndicatorRegistry indicatorRegistry;

    @Override
    public Strategy create(
            BarSeries series,
            StrategyConfig config) {

        Objects.requireNonNull(
                series,
                "BarSeries must not be null"
        );

        Objects.requireNonNull(
                config,
                "StrategyConfig must not be null"
        );

        int minimumBars =
                config.getSlowEmaPeriod() + 1;

        if (series.getBarCount() < minimumBars) {

            throw new IllegalArgumentException(
                    "Not enough bars to build EMA crossover strategy. "
                            + "Required at least "
                            + minimumBars
                            + ", found "
                            + series.getBarCount()
            );
        }

        ClosePriceIndicator closePrice =
                new ClosePriceIndicator(series);

        EMAIndicator fastEma =
                (EMAIndicator) indicatorRegistry
                        .getFactory(IndicatorType.EMA)
                        .create(
                                closePrice,
                                config.getFastEmaPeriod()
                        );

        EMAIndicator slowEma =
                (EMAIndicator) indicatorRegistry
                        .getFactory(IndicatorType.EMA)
                        .create(
                                closePrice,
                                config.getSlowEmaPeriod()
                        );

        var entryRule =
                new CrossedUpIndicatorRule(
                        fastEma,
                        slowEma
                );

        var exitRule =
                new CrossedDownIndicatorRule(
                        fastEma,
                        slowEma
                );

        return new BaseStrategy(
                "EMA_CROSSOVER",
                entryRule,
                exitRule
        );
    }
}
