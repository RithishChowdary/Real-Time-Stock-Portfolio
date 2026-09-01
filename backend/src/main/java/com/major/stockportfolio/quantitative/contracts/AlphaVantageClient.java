package com.major.stockportfolio.quantitative.contracts;

public interface AlphaVantageClient {

    String getDailyTimeSeries(
            String symbol,
            String period,
            String apiKey
    );
}
