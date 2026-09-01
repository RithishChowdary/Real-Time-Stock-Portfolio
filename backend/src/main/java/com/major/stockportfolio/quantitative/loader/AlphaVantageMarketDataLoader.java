package com.major.stockportfolio.quantitative.loader;

import com.major.stockportfolio.quantitative.contracts.MarketDataLoader;
import com.major.stockportfolio.quantitative.dto.api.HistoricalResponse;
import com.major.stockportfolio.quantitative.dto.historical.HistoricalCandle;
import com.major.stockportfolio.quantitative.service.impl.HistoricalDataService;

import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Component;
import org.ta4j.core.BarSeries;
import org.ta4j.core.BaseBarSeriesBuilder;

import java.time.Duration;
import java.time.ZoneId;
import java.util.Objects;

@Component
@Slf4j
public class AlphaVantageMarketDataLoader
        implements MarketDataLoader {

    private static final Duration BAR_DURATION =
            Duration.ofDays(1);

    private static final ZoneId MARKET_ZONE =
            ZoneId.of("Asia/Kolkata");

    private final HistoricalDataService historicalDataService;

    public AlphaVantageMarketDataLoader(
            HistoricalDataService historicalDataService) {

        this.historicalDataService =
                Objects.requireNonNull(
                        historicalDataService,
                        "HistoricalDataService must not be null"
                );
    }

    @Override
    public BarSeries loadSeries(String symbol) {

        if (symbol == null || symbol.isBlank()) {
            throw new IllegalArgumentException(
                    "Symbol must not be empty"
            );
        }

        String normalizedSymbol =
                symbol.trim().toUpperCase();

        log.info(
                "Loading historical market data from Alpha Vantage for {}",
                normalizedSymbol
        );

        HistoricalResponse response =
                historicalDataService.downloadHistoricalData(
                        normalizedSymbol,
                        "DAILY"
                );

        if (response == null
                || response.getCandles() == null
                || response.getCandles().isEmpty()) {

            throw new IllegalArgumentException(
                    "No historical candles received for "
                            + normalizedSymbol
            );
        }

        BarSeries series =
                new BaseBarSeriesBuilder()
                        .withName(normalizedSymbol)
                        .build();

        for (HistoricalCandle candle :
                response.getCandles()) {

            if (candle == null) {
                continue;
            }

            series.barBuilder()
                    .timePeriod(BAR_DURATION)
                    .endTime(
                            candle.getTimestamp()
                                    .atZone(MARKET_ZONE)
                                    .toInstant()
                    )
                    .openPrice(candle.getOpen())
                    .highPrice(candle.getHigh())
                    .lowPrice(candle.getLow())
                    .closePrice(candle.getClose())
                    .volume(candle.getVolume())
                    .add();
        }

        if (series.isEmpty()) {
            throw new IllegalArgumentException(
                    "Unable to create BarSeries for "
                            + normalizedSymbol
            );
        }

        log.info(
                "Alpha Vantage historical data loaded successfully. "
                        + "Symbol: {}, bars: {}",
                normalizedSymbol,
                series.getBarCount()
        );

        return series;
    }
}
