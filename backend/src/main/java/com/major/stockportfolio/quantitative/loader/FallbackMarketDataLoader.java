package com.major.stockportfolio.quantitative.loader;

import com.major.stockportfolio.exception.BadRequestException;
import com.major.stockportfolio.quantitative.contracts.MarketDataLoader;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import org.ta4j.core.BarSeries;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Primary
@Slf4j
public class FallbackMarketDataLoader implements MarketDataLoader {

    private final AlphaVantageMarketDataLoader alphaVantageMarketDataLoader;
    private final CsvMarketDataLoader csvMarketDataLoader;
    private final Map<String, BarSeries> cache = new ConcurrentHashMap<>();

    public FallbackMarketDataLoader(
            AlphaVantageMarketDataLoader alphaVantageMarketDataLoader,
            CsvMarketDataLoader csvMarketDataLoader) {

        this.alphaVantageMarketDataLoader = alphaVantageMarketDataLoader;
        this.csvMarketDataLoader = csvMarketDataLoader;
    }

    @Override
    public BarSeries loadSeries(String symbol) {

        if (symbol == null || symbol.isBlank()) {
            throw new BadRequestException("Stock symbol must not be empty");
        }

        String normalizedSymbol = symbol.trim().toUpperCase();

        // 1. Check in-memory cache
        BarSeries cachedSeries = cache.get(normalizedSymbol);
        if (cachedSeries != null && !cachedSeries.isEmpty()) {
            log.info("Returning cached historical series for {}. Bars: {}", normalizedSymbol, cachedSeries.getBarCount());
            return cachedSeries;
        }

        // 2. Try external API
        try {
            log.info("Attempting to load {} from Alpha Vantage API", normalizedSymbol);

            BarSeries apiSeries = alphaVantageMarketDataLoader.loadSeries(normalizedSymbol);

            if (apiSeries != null && !apiSeries.isEmpty()) {
                log.info("Using API data for {}. Bars: {}", normalizedSymbol, apiSeries.getBarCount());
                cache.put(normalizedSymbol, apiSeries);
                return apiSeries;
            }

            log.warn("API returned no data for {}. Falling back to CSV.", normalizedSymbol);

        } catch (Exception e) {
            log.warn("API data unavailable for {}. Falling back to CSV. Reason: {}", normalizedSymbol, e.getMessage());
        }

        // 3. Fallback to CSV
        try {
            log.info("Loading {} from CSV fallback", normalizedSymbol);

            BarSeries csvSeries = csvMarketDataLoader.loadSeries(normalizedSymbol);

            if (csvSeries != null && !csvSeries.isEmpty()) {
                log.info("Using CSV data for {}. Bars: {}", normalizedSymbol, csvSeries.getBarCount());
                cache.put(normalizedSymbol, csvSeries);
                return csvSeries;
            }

        } catch (Exception e) {
            log.error("CSV fallback also failed for {}", normalizedSymbol, e);
            throw new BadRequestException(
                    "Historical market data is temporarily unavailable for "
                            + normalizedSymbol
                            + ". Please try again later."
            );
        }

        throw new BadRequestException(
                "Historical market data is temporarily unavailable for "
                        + normalizedSymbol
                        + ". Please try again later."
        );
    }
}
