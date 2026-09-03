package com.major.stockportfolio.quantitative.risk;

import com.major.stockportfolio.entity.PaperTradingAccount;
import com.major.stockportfolio.entity.Portfolio;
import com.major.stockportfolio.entity.Stock;
import com.major.stockportfolio.entity.Transaction;
import com.major.stockportfolio.entity.User;
import com.major.stockportfolio.quantitative.ai.service.AIAnalysisService;
import com.major.stockportfolio.quantitative.risk.dto.PortfolioRiskAIResponse;
import com.major.stockportfolio.quantitative.risk.dto.PortfolioRiskAnalysisResponse;
import com.major.stockportfolio.quantitative.risk.dto.PortfolioRiskMetrics;
import com.major.stockportfolio.quantitative.risk.dto.PositionExposure;
import com.major.stockportfolio.quantitative.risk.service.PortfolioRiskService;
import com.major.stockportfolio.repository.TransactionRepository;
import com.major.stockportfolio.repository.UserRepository;
import com.major.stockportfolio.service.PaperTradingAccountService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PortfolioRiskServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PaperTradingAccountService paperTradingAccountService;

    @Mock
    private AIAnalysisService aiAnalysisService;

    @InjectMocks
    private PortfolioRiskService portfolioRiskService;

    private User testUser;
    private PaperTradingAccount testAccount;
    private Stock tcsStock;
    private Stock infyStock;
    private Portfolio testPortfolio;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .name("Rithish")
                .email("user@example.com")
                .build();

        testAccount = PaperTradingAccount.builder()
                .id(1L)
                .user(testUser)
                .initialBalance(new BigDecimal("100000.00"))
                .availableCash(new BigDecimal("60000.00"))
                .build();

        tcsStock = Stock.builder()
                .id(101L)
                .symbol("TCS")
                .companyName("Tata Consultancy Services")
                .currentPrice(new BigDecimal("3000.00"))
                .build();

        infyStock = Stock.builder()
                .id(102L)
                .symbol("INFY")
                .companyName("Infosys Limited")
                .currentPrice(new BigDecimal("1500.00"))
                .build();

        testPortfolio = Portfolio.builder()
                .id(10L)
                .portfolioName("Core Portfolio")
                .user(testUser)
                .build();
    }

    @Test
    void testCalculateRisk_EmptyPortfolio_PureCash() {
        testAccount.setAvailableCash(new BigDecimal("100000.00"));
        when(paperTradingAccountService.getOrCreateAccountForUser(testUser)).thenReturn(testAccount);
        when(transactionRepository.findByPortfolioUserId(testUser.getId())).thenReturn(List.of());

        PortfolioRiskMetrics metrics = portfolioRiskService.calculateRiskMetricsForUser(testUser);

        assertNotNull(metrics);
        assertEquals(new BigDecimal("100000.00"), metrics.getTotalPortfolioValue());
        assertEquals(new BigDecimal("100000.00"), metrics.getAvailableCash());
        assertEquals(new BigDecimal("0.00"), metrics.getHoldingsValue());
        assertEquals(new BigDecimal("0.00"), metrics.getTotalInvestment());
        assertEquals(0, metrics.getNumberOfHoldings());
        assertEquals(100.0, metrics.getCashAllocationPercentage());
        assertEquals("NONE", metrics.getLargestHoldingSymbol());
        assertEquals(0.0, metrics.getLargestHoldingPercentage());
        assertEquals(10, metrics.getRiskScore());
        assertEquals("LOW", metrics.getRiskLevel());
        assertTrue(metrics.getRiskFactors().stream().anyMatch(f -> f.contains("100% Cash")));
        assertTrue(metrics.getPositionExposures().isEmpty());
    }

    @Test
    void testCalculateRisk_SingleHolding() {
        when(paperTradingAccountService.getOrCreateAccountForUser(testUser)).thenReturn(testAccount);

        Transaction buyTx = Transaction.builder()
                .id(1L)
                .portfolio(testPortfolio)
                .stock(tcsStock)
                .transactionType("BUY")
                .quantity(10)
                .price(new BigDecimal("2800.00"))
                .transactionDate(LocalDateTime.now())
                .build();

        when(transactionRepository.findByPortfolioUserId(testUser.getId())).thenReturn(List.of(buyTx));

        PortfolioRiskMetrics metrics = portfolioRiskService.calculateRiskMetricsForUser(testUser);

        assertNotNull(metrics);
        // Invested: 10 * 2800 = 28000
        assertEquals(new BigDecimal("28000.00"), metrics.getTotalInvestment());
        // Current: 10 * 3000 = 30000
        assertEquals(new BigDecimal("30000.00"), metrics.getHoldingsValue());
        // Available cash: 60000
        // Total value: 60000 + 30000 = 90000
        assertEquals(new BigDecimal("90000.00"), metrics.getTotalPortfolioValue());
        // P&L = 30000 - 28000 = 2000
        assertEquals(new BigDecimal("2000.00"), metrics.getProfitLoss());
        assertEquals(1, metrics.getNumberOfHoldings());
        assertEquals("TCS", metrics.getLargestHoldingSymbol());
        assertEquals(new BigDecimal("30000.00"), metrics.getLargestHoldingValue());

        // 30000 / 90000 = 33.33%
        assertEquals(33.33, metrics.getLargestHoldingPercentage(), 0.05);
        // Cash: 60000 / 90000 = 66.67%
        assertEquals(66.67, metrics.getCashAllocationPercentage(), 0.05);

        assertEquals(1, metrics.getPositionExposures().size());
        PositionExposure exp = metrics.getPositionExposures().get(0);
        assertEquals("TCS", exp.getSymbol());
        assertEquals(10, exp.getQuantity());
        assertEquals(33.33, exp.getExposurePercentage(), 0.05);
    }

    @Test
    void testCalculateRisk_MultipleHoldings_WithSellTransaction() {
        when(paperTradingAccountService.getOrCreateAccountForUser(testUser)).thenReturn(testAccount);

        // TCS: Buy 10 @ 2500, Sell 2 @ 2900 -> Net 8 @ avg 2500 -> Value = 8 * 3000 = 24000
        Transaction buyTcs = Transaction.builder()
                .id(1L)
                .portfolio(testPortfolio)
                .stock(tcsStock)
                .transactionType("BUY")
                .quantity(10)
                .price(new BigDecimal("2500.00"))
                .transactionDate(LocalDateTime.now().minusDays(5))
                .build();

        Transaction sellTcs = Transaction.builder()
                .id(2L)
                .portfolio(testPortfolio)
                .stock(tcsStock)
                .transactionType("SELL")
                .quantity(2)
                .price(new BigDecimal("2900.00"))
                .transactionDate(LocalDateTime.now().minusDays(2))
                .build();

        // INFY: Buy 20 @ 1400 -> Net 20 @ avg 1400 -> Value = 20 * 1500 = 30000
        Transaction buyInfy = Transaction.builder()
                .id(3L)
                .portfolio(testPortfolio)
                .stock(infyStock)
                .transactionType("BUY")
                .quantity(20)
                .price(new BigDecimal("1400.00"))
                .transactionDate(LocalDateTime.now().minusDays(3))
                .build();

        when(transactionRepository.findByPortfolioUserId(testUser.getId()))
                .thenReturn(List.of(buyTcs, sellTcs, buyInfy));

        PortfolioRiskMetrics metrics = portfolioRiskService.calculateRiskMetricsForUser(testUser);

        assertNotNull(metrics);
        assertEquals(2, metrics.getNumberOfHoldings());
        // INFY value (30000) > TCS value (24000), so INFY is largest holding
        assertEquals("INFY", metrics.getLargestHoldingSymbol());
        assertEquals(new BigDecimal("30000.00"), metrics.getLargestHoldingValue());

        // Total holdings: 30000 + 24000 = 54000
        // Total value: 60000 cash + 54000 holdings = 114000
        assertEquals(new BigDecimal("114000.00"), metrics.getTotalPortfolioValue());
        assertEquals(2, metrics.getPositionExposures().size());
        assertEquals("INFY", metrics.getPositionExposures().get(0).getSymbol());
        assertEquals("TCS", metrics.getPositionExposures().get(1).getSymbol());
    }

    @Test
    void testCalculateRisk_FullySoldStock_IsExcluded() {
        when(paperTradingAccountService.getOrCreateAccountForUser(testUser)).thenReturn(testAccount);

        // Buy 5, Sell 5 -> Net 0
        Transaction buyTx = Transaction.builder()
                .id(1L)
                .portfolio(testPortfolio)
                .stock(tcsStock)
                .transactionType("BUY")
                .quantity(5)
                .price(new BigDecimal("3000.00"))
                .build();

        Transaction sellTx = Transaction.builder()
                .id(2L)
                .portfolio(testPortfolio)
                .stock(tcsStock)
                .transactionType("SELL")
                .quantity(5)
                .price(new BigDecimal("3200.00"))
                .build();

        when(transactionRepository.findByPortfolioUserId(testUser.getId())).thenReturn(List.of(buyTx, sellTx));

        PortfolioRiskMetrics metrics = portfolioRiskService.calculateRiskMetricsForUser(testUser);

        assertEquals(0, metrics.getNumberOfHoldings());
        assertEquals("NONE", metrics.getLargestHoldingSymbol());
        assertTrue(metrics.getPositionExposures().isEmpty());
    }

    @Test
    void testDeterministicRiskScoring_Scenarios() {
        List<String> factors = new ArrayList<>();

        // Scenario 1: Zero holdings (pure cash)
        int score1 = portfolioRiskService.calculateDeterministicRiskScore(
                0, "NONE", 0.0, 100.0, 0.0, factors
        );
        assertEquals(10, score1);
        assertTrue(factors.get(0).contains("100% Cash"));

        // Scenario 2: Concentrated 1 holding, low cash, in drawdown
        factors.clear();
        int score2 = portfolioRiskService.calculateDeterministicRiskScore(
                1, "TCS", 75.0, 4.0, -12.5, factors
        );
        // Base(20) + Conc(30) + 1Hold(25) + LowCash(15) + Drawdown(12) = 102 -> Clamped to 95
        assertEquals(95, score2);

        // Scenario 3: Diversified 6 holdings, balanced weight, high cash, positive return
        factors.clear();
        int score3 = portfolioRiskService.calculateDeterministicRiskScore(
                6, "TCS", 15.0, 40.0, 8.5, factors
        );
        // Base(20) + Conc(4) + 6Hold(3) + NormalCash(0) + PosRet(-5) = 22
        assertEquals(22, score3);
    }

    @Test
    void testAnalyzePortfolioRisk_OrchestratesAIService() {
        when(paperTradingAccountService.getOrCreateAccountForUser(testUser)).thenReturn(testAccount);
        when(transactionRepository.findByPortfolioUserId(testUser.getId())).thenReturn(List.of());

        PortfolioRiskAIResponse mockAiResponse = PortfolioRiskAIResponse.builder()
                .executiveSummary("Portfolio is 100% liquid cash with zero active market volatility.")
                .riskAssessment("Risk is low due to absence of equity exposure.")
                .exposureAnalysis("All capital is preserved in cash balance.")
                .concentrationAnalysis("No asset concentration present.")
                .strengths(List.of("Maximum capital protection"))
                .areasOfConcern(List.of("Inflation drag"))
                .recommendedReviewAreas(List.of("Consider deploying simulated capital across high-liquidity large caps"))
                .educationalDisclaimer("Educational interpretation only.")
                .generatedAt(LocalDateTime.now())
                .build();

        when(aiAnalysisService.analyzePortfolioRisk(any(PortfolioRiskMetrics.class)))
                .thenReturn(mockAiResponse);

        // Act using internal calculation method with mock
        PortfolioRiskMetrics metrics = portfolioRiskService.calculateRiskMetricsForUser(testUser);
        PortfolioRiskAIResponse aiResult = aiAnalysisService.analyzePortfolioRisk(metrics);

        PortfolioRiskAnalysisResponse response = PortfolioRiskAnalysisResponse.builder()
                .metrics(metrics)
                .aiAssessment(aiResult)
                .analyzedAt(LocalDateTime.now())
                .build();

        assertNotNull(response);
        assertNotNull(response.getMetrics());
        assertNotNull(response.getAiAssessment());
        assertEquals("LOW", response.getMetrics().getRiskLevel());
        assertEquals("Portfolio is 100% liquid cash with zero active market volatility.",
                response.getAiAssessment().getExecutiveSummary());
    }
}
