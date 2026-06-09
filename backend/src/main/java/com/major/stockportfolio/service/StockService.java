package com.major.stockportfolio.service;

import com.major.stockportfolio.entity.Stock;
import com.major.stockportfolio.repository.StockRepository;
import com.major.stockportfolio.websocket.StockPricePublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.major.stockportfolio.exception.ExternalApiException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockService {

    private final StockPricePublisher stockPricePublisher;

    private final AlertService alertService;

    private final PriceSimulationService priceSimulationService;
    
    private final StockRepository stockRepository;

    private final RestTemplate restTemplate;

    @Value("${twelvedata.api.key}")
    private String apiKey;

    @Value("${twelvedata.base.url}")
    private String baseUrl;

    // CREATE STOCK
    public Stock createStock(Stock stock) {

        log.info("Saving stock: {}", stock);

        return stockRepository.save(stock);
    }

    // GET ALL STOCKS
   public Page<Stock> getAllStocks(
        int page,
        int size
) {

    log.info(
            "Fetching stocks with pagination. Page: {}, Size: {}",
            page,
            size
    );

    Pageable pageable =
            PageRequest.of(page, size);

    return stockRepository.findAll(pageable);
}

    // GET STOCK BY SYMBOL
    public Stock getStockBySymbol(String symbol) {

        return stockRepository.findBySymbol(symbol)
                .orElseThrow(() -> {

                    log.error("Stock not found: {}", symbol);

                    return new RuntimeException(
                            "Stock not found: " + symbol
                    );
                });
    }

    // GET LIVE PRICE FROM TWELVE DATA
    public Double getLivePrice(String symbol) {

        
        // TRY BSE
        try {

            return fetchPriceFromApi(
                    symbol + ":BSE"
            );

        } catch (Exception e) {

            log.warn(
                    "BSE failed for {}. Trying NSE...",
                    symbol
            );
        }
        // TRY NSE
        try {

            return fetchPriceFromApi(
                    symbol + ":NSE"
            );

        } catch (Exception e) {

            log.warn(
                    "NSE failed for {}. Using simulated price...",
                    symbol
            );
        }

        // FALLBACK SIMULATION
        Stock stock =
        getStockBySymbol(symbol);

return priceSimulationService
        .generateSimulatedPrice(stock);

    }

    private Double fetchPriceFromApi(
            String formattedSymbol
    ) {

        String url =
                baseUrl +
                "/price?symbol=" +
                formattedSymbol +
                "&apikey=" +
                apiKey;
        log.info(
        "Fetching live stock price for symbol: {}",
        formattedSymbol
        );

        ResponseEntity<Map<String, Object>> responseEntity =
                restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        null,
                        new ParameterizedTypeReference<>() {
                        }
                );

        Map<String, Object> response =
                responseEntity.getBody();

        // EMPTY RESPONSE CHECK
        if (response == null) {

            throw new ExternalApiException(
                    "Empty API response"
            );
        }

        // API ERROR CHECK
        if (
                response.containsKey("status")
                        &&
                        "error".equalsIgnoreCase(
                                response.get("status").toString()
                        )
        ) {

            throw new ExternalApiException(
                    response.toString()
            );
        }

        // PRICE EXTRACTION
        Object priceValue =
                response.get("price");

        if (priceValue == null) {

            throw new RuntimeException(
                    "Price not returned from API"
            );
        }

        Double livePrice =
                Double.parseDouble(
                        priceValue.toString()
                );

        log.info(
                "Live price fetched for {} : {}",
                formattedSymbol,
                livePrice
        );

        return livePrice;
    }

    // REFRESH PRICE + SAVE + PUBLISH
    public Stock refreshAndSavePrice(
            String symbol
    ) {

        // GET STOCK
        Stock stock =
                getStockBySymbol(symbol);

        // FETCH LIVE PRICE
        Double currentPrice =
                getLivePrice(symbol);

        // ROUND TO 2 DECIMAL PLACES
        BigDecimal roundedPrice =
                BigDecimal.valueOf(currentPrice)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        // UPDATE ENTITY
        stock.setCurrentPrice(
                roundedPrice
        );

        stock.setLastUpdated(
                LocalDateTime.now()
        );

        // SAVE TO DATABASE
        Stock savedStock =
                stockRepository.save(stock);

        // PUBLISH VIA WEBSOCKET
        stockPricePublisher
                .publishStockUpdate(
                        savedStock
                );

        alertService.checkAlerts(savedStock);

        log.info(
                "Stock updated successfully: {}",
                savedStock.getSymbol()
        );

        return savedStock;
    }
}
