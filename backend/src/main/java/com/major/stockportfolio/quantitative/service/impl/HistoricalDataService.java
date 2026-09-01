package com.major.stockportfolio.quantitative.service.impl;

import com.major.stockportfolio.quantitative.config.AlphaVantageProperties;
import com.major.stockportfolio.quantitative.contracts.HistoricalDataDownloader;
import com.major.stockportfolio.quantitative.dto.api.HistoricalResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class HistoricalDataService {

    private final HistoricalDataDownloader downloader;
    private final AlphaVantageProperties alphaVantageProperties;

    public HistoricalResponse downloadHistoricalData(
            String symbol,
            String interval) {

        log.info(
                "Requesting historical data for symbol: {}, interval: {}",
                symbol,
                interval
        );

        return downloader.download(
                symbol,
                interval,
                alphaVantageProperties.getApiKey()
        );
    }
}