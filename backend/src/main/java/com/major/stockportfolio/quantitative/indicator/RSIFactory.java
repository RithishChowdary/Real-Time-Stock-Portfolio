package com.major.stockportfolio.quantitative.indicator;

import com.major.stockportfolio.quantitative.contracts.IndicatorFactory;
import org.ta4j.core.Indicator;
import org.ta4j.core.indicators.RSIIndicator;
import org.ta4j.core.indicators.helpers.ClosePriceIndicator;
import org.ta4j.core.num.Num;

public class RSIFactory implements IndicatorFactory {

    @Override
    public Indicator<Num> create(
            ClosePriceIndicator closePrice,
            int period) {

        return new RSIIndicator(
                closePrice,
                period
        );
    }
}
