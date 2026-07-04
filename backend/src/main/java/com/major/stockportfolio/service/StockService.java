package com.major.stockportfolio.service;

import com.major.stockportfolio.entity.Stock;
import com.major.stockportfolio.interfaces.MarketDataProvider;
import com.major.stockportfolio.repository.StockRepository;
import com.major.stockportfolio.websocket.StockPricePublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockService {

    private final StockPricePublisher stockPricePublisher;

    private final AlertService alertService;

    private final PriceSimulationService priceSimulationService;

    private final StockRepository stockRepository;

    private final MarketDataProvider marketDataProvider;

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

    // MARKET DATA ABSTRACTION
    public Double getLivePrice(String symbol) {

        try {

            return marketDataProvider
                    .getCurrentPrice(symbol);

        } catch (Exception e) {

            log.warn(
                    "API failed for {}. Using simulated price.",
                    symbol
            );
        }

        Stock stock =
                getStockBySymbol(symbol);

        return priceSimulationService
                .generateSimulatedPrice(stock);
    }

    // REFRESH PRICE + SAVE + PUBLISH
    public Stock refreshAndSavePrice(
            String symbol
    ) {

        Stock stock =
                getStockBySymbol(symbol);

        Double currentPrice =
                getLivePrice(symbol);

        BigDecimal roundedPrice =
                BigDecimal.valueOf(currentPrice)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        stock.setCurrentPrice(
                roundedPrice
        );

        stock.setLastUpdated(
                LocalDateTime.now()
        );

        Stock savedStock =
                stockRepository.save(stock);

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