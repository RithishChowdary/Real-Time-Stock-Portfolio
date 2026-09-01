package com.major.stockportfolio.quantitative.strategy;

import java.util.EnumMap;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.major.stockportfolio.quantitative.contracts.StrategyFactory;
import com.major.stockportfolio.quantitative.indicator.IndicatorRegistry;
import com.major.stockportfolio.quantitative.model.StrategyType;

@Component
public class StrategyRegistry {

    private final Map<StrategyType, StrategyFactory> registry;

    public StrategyRegistry(
            IndicatorRegistry indicatorRegistry) {

        this.registry = new EnumMap<>(StrategyType.class);

       registry.put(
        StrategyType.EMA_RSI,
        new EmaRsiStrategyFactory(
                indicatorRegistry
        )
);

        registry.put(
                StrategyType.EMA_CROSSOVER,
                new EmaCrossoverStrategyFactory(
                        indicatorRegistry
                )
        );
    }

    public StrategyFactory getFactory(
            StrategyType type) {

        if (type == null) {
            throw new IllegalArgumentException(
                    "Strategy type must not be null"
            );
        }

        StrategyFactory factory =
                registry.get(type);

        if (factory == null) {
            throw new IllegalArgumentException(
                    "No strategy registered for type: "
                            + type
            );
        }

        return factory;
    }
}
