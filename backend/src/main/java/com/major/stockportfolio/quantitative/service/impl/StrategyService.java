package com.major.stockportfolio.quantitative.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.ta4j.core.BarSeries;
import org.ta4j.core.Strategy;

import com.major.stockportfolio.quantitative.config.StrategyConfig;
import com.major.stockportfolio.quantitative.model.StrategyType;
import com.major.stockportfolio.quantitative.strategy.StrategyRegistry;

@Service
@RequiredArgsConstructor
public class StrategyService {

    private final StrategyRegistry registry;

    public Strategy getStrategy(
            StrategyType type,
            BarSeries series,
            StrategyConfig config) {

        return registry
                .getFactory(type)
                .create(series, config);
    }
}
