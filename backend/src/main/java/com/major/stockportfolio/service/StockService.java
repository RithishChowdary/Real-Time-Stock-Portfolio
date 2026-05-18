package com.major.stockportfolio.service;

import com.major.stockportfolio.dto.IndianStockPriceResponse;
import com.major.stockportfolio.entity.Stock;
import com.major.stockportfolio.repository.StockRepository;
import com.major.stockportfolio.websocket.StockPricePublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StockService {

    private final StockPricePublisher stockPricePublisher;
    private final StockRepository stockRepository;
    private final RestTemplate restTemplate;
    private final AlertService alertService;   

    @Value("${indian.api.key}")
    private String apiKey;

    @Value("${indian.api.base.url}")
    private String baseUrl;

    // CREATE STOCK
    public Stock createStock(Stock stock) {
        System.out.println("Saving stock: " + stock);
        return stockRepository.save(stock);
    }

    // GET ALL STOCKS
    public List<Stock> getAllStocks() {
        return stockRepository.findAll();
    }

    // GET STOCK BY SYMBOL
    public Stock getStockBySymbol(String symbol) {
        return stockRepository.findBySymbol(symbol)
                .orElseThrow(() -> new RuntimeException("Stock not found"));
    }

    // GET LIVE PRICE (Dummy response for now)
    public IndianStockPriceResponse getLivePrice(String symbol) {
        IndianStockPriceResponse response = new IndianStockPriceResponse();
        response.setSymbol(symbol);
        response.setCompanyName("Gokaldas Exports Ltd");
        response.setCurrentPrice(673.00);
        return response;
    }

    // REFRESH PRICE + SAVE + PUBLISH VIA WEBSOCKET + CHECK ALERTS
    public Stock refreshAndSavePrice(String symbol) {

        // 1. Get stock from DB
        Stock stock = getStockBySymbol(symbol);

        // 2. Fetch latest price
        IndianStockPriceResponse livePrice = getLivePrice(symbol);

        System.out.println("Live Price Response: " + livePrice);

        // 3. Validate response
        if (livePrice == null) {
            throw new RuntimeException("API returned null response");
        }

        if (livePrice.getCurrentPrice() == null) {
            throw new RuntimeException("Current price is null. Check DTO mapping.");
        }

        // 4. Update stock fields
        stock.setCurrentPrice(
                BigDecimal.valueOf(livePrice.getCurrentPrice())
        );
        stock.setCompanyName(livePrice.getCompanyName());
        stock.setLastUpdated(LocalDateTime.now());

        // 5. Save updated stock
        Stock savedStock = stockRepository.save(stock);

        // 6. Publish stock update via WebSocket
        stockPricePublisher.publishStockUpdate(savedStock);

        // 7. Check if any alerts are triggered
        alertService.checkAlerts(savedStock);

        // 8. Return updated stock
        return savedStock;
    }
}