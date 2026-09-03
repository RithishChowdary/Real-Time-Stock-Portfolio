package com.major.stockportfolio.quantitative.ai.service;

import com.major.stockportfolio.exception.BadRequestException;
import com.major.stockportfolio.quantitative.ai.contracts.AIAnalysisProvider;
import com.major.stockportfolio.quantitative.ai.dto.AIAnalysisRequest;
import com.major.stockportfolio.quantitative.ai.dto.AIAnalysisResponse;
import com.major.stockportfolio.quantitative.risk.dto.PortfolioRiskAIResponse;
import com.major.stockportfolio.quantitative.risk.dto.PortfolioRiskMetrics;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIAnalysisService {

    private final AIAnalysisProvider aiAnalysisProvider;

    public AIAnalysisResponse analyze(AIAnalysisRequest request) {
        if (request == null) {
            throw new BadRequestException("AI analysis request must not be null");
        }

        if (request.getSymbol() == null || request.getSymbol().trim().isBlank()) {
            throw new BadRequestException("Stock symbol is required for AI analysis");
        }

        if (request.getStrategy() == null || request.getStrategy().trim().isBlank()) {
            throw new BadRequestException("Strategy name is required for AI analysis");
        }

        log.info("Executing AI quantitative analysis for symbol: {}, strategy: {}",
                request.getSymbol(), request.getStrategy());

        return aiAnalysisProvider.analyze(request);
    }

    public PortfolioRiskAIResponse analyzePortfolioRisk(PortfolioRiskMetrics metrics) {
        if (metrics == null) {
            throw new BadRequestException("Portfolio risk metrics must not be null for AI interpretation");
        }

        log.info("Executing AI portfolio risk interpretation. Total Value: ₹{}, Holdings: {}, Risk Score: {}",
                metrics.getTotalPortfolioValue(), metrics.getNumberOfHoldings(), metrics.getRiskScore());

        return aiAnalysisProvider.analyzePortfolioRisk(metrics);
    }
}
