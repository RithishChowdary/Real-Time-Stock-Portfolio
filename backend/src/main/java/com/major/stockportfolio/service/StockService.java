package com.major.stockportfolio.service;

import com.major.stockportfolio.dto.IndianStockPriceResponse;
import com.major.stockportfolio.entity.Stock;
import com.major.stockportfolio.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StockService {

    private final StockRepository stockRepository;
    private final RestTemplate restTemplate;

    @Value("${indian.api.key}")
    private String apiKey;

    @Value("${indian.api.base.url}")
    private String baseUrl;

    public Stock createStock(Stock stock) {
    System.out.println("Saving stock: " + stock);
    return stockRepository.save(stock);
}

    public List<Stock> getAllStocks() {
        return stockRepository.findAll();
    }

    public Stock getStockBySymbol(String symbol) {
        return stockRepository.findBySymbol(symbol)
                .orElseThrow(() -> new RuntimeException("Stock not found"));
    }

   public IndianStockPriceResponse getLivePrice(String symbol) {
    IndianStockPriceResponse response = new IndianStockPriceResponse();
    response.setSymbol(symbol);
    response.setCompanyName("Tata Consultancy Services");
    response.setCurrentPrice(2246.75);
    return response;
}

    public Stock refreshAndSavePrice(String symbol) {
    Stock stock = getStockBySymbol(symbol);

    IndianStockPriceResponse livePrice = getLivePrice(symbol);

    System.out.println("Live Price Response: " + livePrice);

    if (livePrice == null) {
        throw new RuntimeException("API returned null response");
    }

    if (livePrice.getCurrentPrice() == null) {
        throw new RuntimeException("Current price is null. Check DTO mapping.");
    }

    stock.setCurrentPrice(
            BigDecimal.valueOf(livePrice.getCurrentPrice())
    );
    stock.setCompanyName(livePrice.getCompanyName());
    stock.setLastUpdated(LocalDateTime.now());

    return stockRepository.save(stock);
}
}