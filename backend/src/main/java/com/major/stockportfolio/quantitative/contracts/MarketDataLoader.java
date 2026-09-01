package com.major.stockportfolio.quantitative.contracts;

import org.ta4j.core.BarSeries;

public interface MarketDataLoader {

    BarSeries loadSeries(String symbol);
}
