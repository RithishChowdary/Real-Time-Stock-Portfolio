package com.major.stockportfolio.quantitative.risk;

import com.major.stockportfolio.quantitative.risk.controller.PortfolioRiskController;
import com.major.stockportfolio.quantitative.risk.dto.PortfolioRiskAIResponse;
import com.major.stockportfolio.quantitative.risk.dto.PortfolioRiskAnalysisResponse;
import com.major.stockportfolio.quantitative.risk.dto.PortfolioRiskMetrics;
import com.major.stockportfolio.quantitative.risk.dto.PositionExposure;
import com.major.stockportfolio.quantitative.risk.service.PortfolioRiskService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PortfolioRiskControllerTest {

    @Mock
    private PortfolioRiskService portfolioRiskService;

    @InjectMocks
    private PortfolioRiskController portfolioRiskController;

    private PortfolioRiskMetrics testMetrics;
    private PortfolioRiskAnalysisResponse testAnalysisResponse;

    @BeforeEach
    void setUp() {
        testMetrics = PortfolioRiskMetrics.builder()
                .totalPortfolioValue(new BigDecimal("100000.00"))
                .availableCash(new BigDecimal("40000.00"))
                .holdingsValue(new BigDecimal("60000.00"))
                .totalInvestment(new BigDecimal("55000.00"))
                .profitLoss(new BigDecimal("5000.00"))
                .returnPercentage(9.09)
                .numberOfHoldings(2)
                .largestHoldingSymbol("TCS")
                .largestHoldingValue(new BigDecimal("35000.00"))
                .largestHoldingPercentage(35.0)
                .cashAllocationPercentage(40.0)
                .riskScore(45)
                .riskLevel("MODERATE")
                .riskFactors(List.of("Elevated concentration in TCS"))
                .positionExposures(List.of(
                        PositionExposure.builder()
                                .symbol("TCS")
                                .companyName("Tata Consultancy Services")
                                .quantity(10)
                                .averagePrice(new BigDecimal("3200.00"))
                                .currentPrice(new BigDecimal("3500.00"))
                                .investedValue(new BigDecimal("32000.00"))
                                .currentValue(new BigDecimal("35000.00"))
                                .profitLoss(new BigDecimal("3000.00"))
                                .returnPercentage(9.38)
                                .exposurePercentage(35.0)
                                .build()
                ))
                .calculatedAt(LocalDateTime.now())
                .build();

        PortfolioRiskAIResponse aiResponse = PortfolioRiskAIResponse.builder()
                .executiveSummary("Portfolio shows balanced moderate risk.")
                .riskAssessment("Risk score of 45/100 reflects sound liquidity.")
                .exposureAnalysis("TCS holds 35% portfolio weight.")
                .concentrationAnalysis("Consider adding 1-2 additional non-correlated assets.")
                .strengths(List.of("Positive return", "Healthy cash buffer"))
                .areasOfConcern(List.of("Single-stock reliance"))
                .recommendedReviewAreas(List.of("Review sector diversity"))
                .educationalDisclaimer("Educational analysis only.")
                .generatedAt(LocalDateTime.now())
                .build();

        testAnalysisResponse = PortfolioRiskAnalysisResponse.builder()
                .metrics(testMetrics)
                .aiAssessment(aiResponse)
                .analyzedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void testGetPortfolioRisk_Success() {
        when(portfolioRiskService.calculatePortfolioRisk()).thenReturn(testMetrics);

        ResponseEntity<PortfolioRiskMetrics> response = portfolioRiskController.getPortfolioRisk();

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(new BigDecimal("100000.00"), response.getBody().getTotalPortfolioValue());
        assertEquals(45, response.getBody().getRiskScore());
        assertEquals("MODERATE", response.getBody().getRiskLevel());
        verify(portfolioRiskService, times(1)).calculatePortfolioRisk();
    }

    @Test
    void testAnalyzePortfolioRisk_Success() {
        when(portfolioRiskService.analyzePortfolioRisk()).thenReturn(testAnalysisResponse);

        ResponseEntity<PortfolioRiskAnalysisResponse> response = portfolioRiskController.analyzePortfolioRisk();

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody().getMetrics());
        assertNotNull(response.getBody().getAiAssessment());
        assertEquals("Portfolio shows balanced moderate risk.", response.getBody().getAiAssessment().getExecutiveSummary());
        verify(portfolioRiskService, times(1)).analyzePortfolioRisk();
    }
}
