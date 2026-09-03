package com.major.stockportfolio.quantitative.risk.controller;

import com.major.stockportfolio.quantitative.risk.dto.PortfolioRiskAnalysisResponse;
import com.major.stockportfolio.quantitative.risk.dto.PortfolioRiskMetrics;
import com.major.stockportfolio.quantitative.risk.service.PortfolioRiskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/portfolio/risk")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Portfolio Risk Analysis", description = "Authoritative Java-calculated risk metrics and AI risk interpretation")
public class PortfolioRiskController {

    private final PortfolioRiskService portfolioRiskService;

    @GetMapping
    @Operation(summary = "Get Authoritative Portfolio Risk Metrics",
            description = "Calculates and returns deterministic portfolio risk metrics, exposures, and concentration from live account and holding data.")
    public ResponseEntity<PortfolioRiskMetrics> getPortfolioRisk() {
        return ResponseEntity.ok(portfolioRiskService.calculatePortfolioRisk());
    }

    @PostMapping("/analysis")
    @Operation(summary = "Analyze Portfolio Risk with Gemini AI",
            description = "Computes authoritative portfolio risk metrics and generates an institutional AI risk interpretation grounded strictly in those metrics.")
    public ResponseEntity<PortfolioRiskAnalysisResponse> analyzePortfolioRisk() {
        return ResponseEntity.ok(portfolioRiskService.analyzePortfolioRisk());
    }
}
