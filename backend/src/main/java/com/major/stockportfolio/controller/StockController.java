package com.major.stockportfolio.controller;
import com.major.stockportfolio.dto.StockResponse;
import com.major.stockportfolio.entity.Stock;
import com.major.stockportfolio.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;import org.springframework.data.domain.Page;

@RestController
@RequestMapping("/api/stocks")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StockResponse> createStock(@RequestBody Stock stock) {
        Stock createdStock = stockService.createStock(stock);
        return ResponseEntity.ok(toStockResponse(createdStock));
    }

        @GetMapping
        public ResponseEntity<Page<StockResponse>> getAllStocks(

                @RequestParam(defaultValue = "0")
                int page,

                @RequestParam(defaultValue = "5")
                int size
        ) 
        {

    Page<StockResponse> stocks =
            stockService.getAllStocks(page, size)
                    .map(this::toStockResponse);

    return ResponseEntity.ok(stocks);
}

    @GetMapping("/{symbol}")
    public ResponseEntity<StockResponse> getStockBySymbol(@PathVariable String symbol) {
        Stock stock = stockService.getStockBySymbol(symbol);
        return ResponseEntity.ok(toStockResponse(stock));
    }

    @GetMapping("/price/{symbol}")
    public ResponseEntity<Double> getLivePrice(
            @PathVariable String symbol) {

        return ResponseEntity.ok(
                stockService.getLivePrice(symbol)
        );
    }

    @PutMapping("/refresh/{symbol}")
    public ResponseEntity<StockResponse> refreshPrice(
            @PathVariable String symbol) {
        Stock refreshedStock = stockService.refreshAndSavePrice(symbol);
        return ResponseEntity.ok(toStockResponse(refreshedStock));
    }

    private StockResponse toStockResponse(Stock stock) {
        return StockResponse.builder()
                .id(stock.getId())
                .symbol(stock.getSymbol())
                .companyName(stock.getCompanyName())
                .currentPrice(stock.getCurrentPrice())
                .lastUpdated(stock.getLastUpdated())
                .build();
    }
}
