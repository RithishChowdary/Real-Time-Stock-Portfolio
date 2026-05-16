package com.major.stockportfolio.controller;

import com.major.stockportfolio.dto.*;
import com.major.stockportfolio.entity.Transaction;
import com.major.stockportfolio.service.TransactionService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

 @GetMapping
public ResponseEntity<List<Transaction>> getAllTransactions() {
    return ResponseEntity.ok(transactionService.getAllTransactions());
}
    @PostMapping("/buy")
    public ResponseEntity<TransactionResponse> buyStock(
            @RequestBody BuyStockRequest request) {
        return ResponseEntity.ok(transactionService.buyStock(request));
    }

    @PostMapping("/sell")
    public ResponseEntity<TransactionResponse> sellStock(
            @RequestBody SellStockRequest request) {
        return ResponseEntity.ok(transactionService.sellStock(request));
    }

    @GetMapping("/holdings/{portfolioId}")
    public ResponseEntity<List<HoldingResponse>> getHoldings(
            @PathVariable Long portfolioId) {
        return ResponseEntity.ok(
                transactionService.getHoldings(portfolioId)
        );
    }

    @GetMapping("/summary/{portfolioId}")
    public ResponseEntity<PortfolioSummaryResponse> getSummary(
            @PathVariable Long portfolioId) {
        return ResponseEntity.ok(
                transactionService.getPortfolioSummary(portfolioId)
        );
    }
}