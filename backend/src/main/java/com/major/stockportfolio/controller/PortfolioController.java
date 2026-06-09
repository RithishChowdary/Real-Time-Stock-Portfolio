package com.major.stockportfolio.controller;

import com.major.stockportfolio.dto.PortfolioRequest;
import com.major.stockportfolio.dto.PortfolioResponse;
import com.major.stockportfolio.service.PortfolioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.util.List;

@RestController
@RequestMapping("/api/portfolios")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class PortfolioController {

    private final PortfolioService portfolioService;

    @PostMapping
    public ResponseEntity<PortfolioResponse> createPortfolio(
            @Valid @RequestBody PortfolioRequest request) {

        return ResponseEntity.ok(
                portfolioService.createPortfolio(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<PortfolioResponse>> getMyPortfolios() {
        return ResponseEntity.ok(
                portfolioService.getMyPortfolios()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<PortfolioResponse> getPortfolioById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                portfolioService.getPortfolioById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<PortfolioResponse> updatePortfolio(
            @PathVariable Long id,
            @Valid @RequestBody PortfolioRequest request) {

        return ResponseEntity.ok(
                portfolioService.updatePortfolio(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePortfolio(
            @PathVariable Long id) {

        portfolioService.deletePortfolio(id);
        return ResponseEntity.ok("Portfolio deleted successfully");
    }
}