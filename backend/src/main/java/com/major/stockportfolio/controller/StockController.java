package com.major.stockportfolio.controller;

import com.major.stockportfolio.dto.IndianStockPriceResponse;
import com.major.stockportfolio.entity.Stock;
import com.major.stockportfolio.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @PostMapping
    public ResponseEntity<Stock> createStock(@RequestBody Stock stock) {
        return ResponseEntity.ok(stockService.createStock(stock));
    }

    @GetMapping
    public ResponseEntity<List<Stock>> getAllStocks() {
        return ResponseEntity.ok(stockService.getAllStocks());
    }

    @GetMapping("/{symbol}")
    public ResponseEntity<Stock> getStockBySymbol(@PathVariable String symbol) {
        return ResponseEntity.ok(stockService.getStockBySymbol(symbol));
    }

    @GetMapping("/price/{symbol}")
    public ResponseEntity<IndianStockPriceResponse> getLivePrice(
            @PathVariable String symbol) {
        return ResponseEntity.ok(stockService.getLivePrice(symbol));
    }

    @PutMapping("/refresh/{symbol}")
    public ResponseEntity<Stock> refreshPrice(
            @PathVariable String symbol) {
        return ResponseEntity.ok(stockService.refreshAndSavePrice(symbol)
        );
    }
}