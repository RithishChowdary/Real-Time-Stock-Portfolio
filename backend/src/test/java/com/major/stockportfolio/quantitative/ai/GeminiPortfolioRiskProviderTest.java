package com.major.stockportfolio.quantitative.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.major.stockportfolio.exception.BadRequestException;
import com.major.stockportfolio.quantitative.ai.config.AIProperties;
import com.major.stockportfolio.quantitative.ai.provider.GeminiAIProvider;
import com.major.stockportfolio.quantitative.risk.dto.PortfolioRiskMetrics;
import com.major.stockportfolio.quantitative.risk.dto.PositionExposure;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class GeminiPortfolioRiskProviderTest {

    private GeminiAIProvider geminiAIProvider;
    private PortfolioRiskMetrics testMetrics;

    @BeforeEach
    void setUp() {
        AIProperties aiProperties = new AIProperties();
        aiProperties.getGemini().setApiKey("test-api-key");
        geminiAIProvider = new GeminiAIProvider(aiProperties, new ObjectMapper());

        testMetrics = PortfolioRiskMetrics.builder()
                .totalPortfolioValue(new BigDecimal("120000.00"))
                .availableCash(new BigDecimal("30000.00"))
                .holdingsValue(new BigDecimal("90000.00"))
                .totalInvestment(new BigDecimal("80000.00"))
                .profitLoss(new BigDecimal("10000.00"))
                .returnPercentage(12.5)
                .numberOfHoldings(2)
                .largestHoldingSymbol("TCS")
                .largestHoldingValue(new BigDecimal("60000.00"))
                .largestHoldingPercentage(50.0)
                .cashAllocationPercentage(25.0)
                .riskScore(65)
                .riskLevel("HIGH")
                .riskFactors(List.of("High single-stock concentration: TCS represents 50.0% of portfolio"))
                .positionExposures(List.of(
                        PositionExposure.builder()
                                .symbol("TCS")
                                .companyName("Tata Consultancy Services")
                                .quantity(20)
                                .averagePrice(new BigDecimal("2500.00"))
                                .currentPrice(new BigDecimal("3000.00"))
                                .investedValue(new BigDecimal("50000.00"))
                                .currentValue(new BigDecimal("60000.00"))
                                .profitLoss(new BigDecimal("10000.00"))
                                .returnPercentage(20.0)
                                .exposurePercentage(50.0)
                                .build()
                ))
                .calculatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void testBuildPortfolioRiskPrompt_ContainsAuthoritativeMetrics() {
        String prompt = geminiAIProvider.buildPortfolioRiskPrompt(testMetrics);

        assertNotNull(prompt);
        assertTrue(prompt.contains("Total Portfolio Value: ₹120000.00"));
        assertTrue(prompt.contains("Available Cash: ₹30000.00"));
        assertTrue(prompt.contains("Holdings Value: ₹90000.00"));
        assertTrue(prompt.contains("Profit / Loss: ₹10000.00"));
        assertTrue(prompt.contains("Return Percentage: 12.50%"));
        assertTrue(prompt.contains("Largest Holding: TCS (₹60000.00, 50.00% of portfolio)"));
        assertTrue(prompt.contains("Deterministic Risk Score: 65 / 100"));
        assertTrue(prompt.contains("Risk Level: HIGH"));
        assertTrue(prompt.contains("TCS (Tata Consultancy Services): 20 units"));
        assertTrue(prompt.contains("AUTHORITATIVE GROUND TRUTH"));
    }

    @Test
    void testAnalyzePortfolioRisk_MissingApiKeyThrowsCleanException() {
        AIProperties emptyProperties = new AIProperties();
        emptyProperties.getGemini().setApiKey(""); // Missing key
        GeminiAIProvider providerWithoutKey = new GeminiAIProvider(emptyProperties, new ObjectMapper());

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> providerWithoutKey.analyzePortfolioRisk(testMetrics));

        assertTrue(ex.getMessage().contains("GEMINI_API_KEY"));
    }
}
