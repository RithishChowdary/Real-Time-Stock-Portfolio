package com.major.stockportfolio.quantitative.contracts;

import org.ta4j.core.BarSeries;
import org.ta4j.core.Strategy;

import com.major.stockportfolio.quantitative.config.StrategyConfig;

public interface StrategyFactory {

    Strategy create(
            BarSeries series,
            StrategyConfig config
    );
}
