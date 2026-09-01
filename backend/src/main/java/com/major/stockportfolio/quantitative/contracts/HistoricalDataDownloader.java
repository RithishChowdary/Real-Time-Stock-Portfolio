package com.major.stockportfolio.quantitative.contracts;

import com.major.stockportfolio.quantitative.dto.api.HistoricalResponse;

public interface HistoricalDataDownloader {

    HistoricalResponse download(
            String symbol,
            String interval,
            String apiKey
    );
}
