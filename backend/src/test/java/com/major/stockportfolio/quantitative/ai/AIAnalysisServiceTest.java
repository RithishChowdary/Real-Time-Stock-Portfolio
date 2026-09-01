package com.major.stockportfolio.quantitative.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.major.stockportfolio.exception.BadRequestException;
import com.major.stockportfolio.quantitative.ai.config.AIProperties;
import com.major.stockportfolio.quantitative.ai.contracts.AIAnalysisProvider;
import com.major.stockportfolio.quantitative.ai.dto.AIAnalysisRequest;
import com.major.stockportfolio.quantitative.ai.dto.AIAnalysisResponse;
import com.major.stockportfolio.quantitative.ai.provider.GeminiAIProvider;
import com.major.stockportfolio.quantitative.ai.service.AIAnalysisService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AIAnalysisServiceTest {

    @Mock
    private AIAnalysisProvider mockProvider;

    private AIAnalysisService aiAnalysisService;
    private AIAnalysisRequest testRequest;

    @BeforeEach
    void setUp() {
        aiAnalysisService = new AIAnalysisService(mockProvider);

        testRequest = AIAnalysisRequest.builder()
                .symbol("TCS")
                .strategy("EMA_RSI")
                .totalTrades(10)
                .winningTrades(7)
                .losingTrades(3)
                .winRate(70.0)
                .totalProfit(15000.0)
                .totalLoss(3000.0)
                .totalEarnings(12000.0)
                .averageProfit(1200.0)
                .maximumDrawdown(5.5)
                .profitFactor(5.0)
                .build();
    }

    @Test
    void testAnalyze_Success() {
        AIAnalysisResponse mockResponse = AIAnalysisResponse.builder()
                .symbol("TCS")
                .strategy("EMA_RSI")
                .summary("The strategy achieved a 70% win rate across 10 trades with strong overall profitability.")
                .performanceAnalysis("Solid risk-adjusted returns with a 5.0 profit factor and controlled 5.5% max drawdown.")
                .strengths(List.of("High win rate", "Strong profit factor"))
                .weaknesses(List.of("Small trade sample size"))
                .riskObservations(List.of("Drawdown was well managed"))
                .marketBehavior("Favorable trending conditions")
                .interpretation("Strategy appears effective for trending regimes but requires out-of-sample confirmation.")
                .generatedAt(LocalDateTime.now())
                .build();

        when(mockProvider.analyze(testRequest)).thenReturn(mockResponse);

        AIAnalysisResponse response = aiAnalysisService.analyze(testRequest);

        assertNotNull(response);
        assertEquals("TCS", response.getSymbol());
        assertEquals("EMA_RSI", response.getStrategy());
        assertEquals(2, response.getStrengths().size());
        assertEquals(1, response.getWeaknesses().size());
        verify(mockProvider, times(1)).analyze(testRequest);
    }

    @Test
    void testAnalyze_NullRequest() {
        assertThrows(BadRequestException.class, () -> aiAnalysisService.analyze(null));
    }

    @Test
    void testAnalyze_BlankSymbol() {
        testRequest.setSymbol("");
        assertThrows(BadRequestException.class, () -> aiAnalysisService.analyze(testRequest));
    }

    @Test
    void testAnalyze_BlankStrategy() {
        testRequest.setStrategy("   ");
        assertThrows(BadRequestException.class, () -> aiAnalysisService.analyze(testRequest));
    }

    @Test
    void testPromptConstruction_ContainsActualMetrics() {
        AIProperties properties = new AIProperties();
        properties.getGemini().setApiKey("test-key");
        GeminiAIProvider provider = new GeminiAIProvider(properties, new ObjectMapper());

        String prompt = provider.buildPrompt(testRequest);

        assertNotNull(prompt);
        assertTrue(prompt.contains("TCS"));
        assertTrue(prompt.contains("EMA_RSI"));
        assertTrue(prompt.contains("Total Trades: 10"));
        assertTrue(prompt.contains("Win Rate: 70.0%"));
        assertTrue(prompt.contains("Total Earnings: ₹12000.0"));
        assertTrue(prompt.contains("Maximum Drawdown: 5.5%"));
        assertTrue(prompt.contains("Profit Factor: 5.0"));
    }

    @Test
    void testPromptConstruction_InfiniteProfitFactorHandled() {
        testRequest.setProfitFactor(Double.POSITIVE_INFINITY);
        testRequest.setLosingTrades(0);

        AIProperties properties = new AIProperties();
        properties.getGemini().setApiKey("test-key");
        GeminiAIProvider provider = new GeminiAIProvider(properties, new ObjectMapper());

        String prompt = provider.buildPrompt(testRequest);

        assertTrue(prompt.contains("Infinity (no losing trades)"));
    }

    @Test
    void testProvider_MissingApiKeyThrowsCleanException() {
        AIProperties properties = new AIProperties();
        properties.getGemini().setApiKey(""); // Missing key
        GeminiAIProvider provider = new GeminiAIProvider(properties, new ObjectMapper());

        BadRequestException ex = assertThrows(BadRequestException.class, () -> provider.analyze(testRequest));
        assertTrue(ex.getMessage().contains("GEMINI_API_KEY"));
    }
}
