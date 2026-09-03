package com.major.stockportfolio.service;

import com.major.stockportfolio.dto.DashboardSummaryDto;
import com.major.stockportfolio.entity.PaperTradingAccount;
import com.major.stockportfolio.entity.User;
import com.major.stockportfolio.repository.AlertRepository;
import com.major.stockportfolio.repository.NotificationRepository;
import com.major.stockportfolio.repository.PortfolioRepository;
import com.major.stockportfolio.repository.TransactionRepository;
import com.major.stockportfolio.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private AlertRepository alertRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PortfolioRepository portfolioRepository;

    @Mock
    private PaperTradingAccountService paperTradingAccountService;

    @InjectMocks
    private DashboardService dashboardService;

    private User testUser;
    private PaperTradingAccount testAccount;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .name("Rithish")
                .email("test@example.com")
                .role("USER")
                .build();

        testAccount = PaperTradingAccount.builder()
                .id(10L)
                .user(testUser)
                .availableCash(new BigDecimal("100000.00"))
                .initialBalance(new BigDecimal("100000.00"))
                .build();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(testUser.getEmail(), "pass")
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void testGetDashboardSummary_FreshAccount() {
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(transactionRepository.findByPortfolioUserId(testUser.getId())).thenReturn(Collections.emptyList());
        when(alertRepository.findByUserId(testUser.getId())).thenReturn(Collections.emptyList());
        when(notificationRepository.findByUserId(testUser.getId())).thenReturn(Collections.emptyList());
        when(paperTradingAccountService.getOrCreateAccountForUser(testUser)).thenReturn(testAccount);

        DashboardSummaryDto summary = dashboardService.getDashboardSummary();

        assertNotNull(summary);
        assertEquals(new BigDecimal("100000.00"), summary.getAvailableCash());
        assertEquals(new BigDecimal("100000.00"), summary.getTotalPortfolioValue());
        assertEquals(BigDecimal.ZERO, summary.getTotalInvestment());
        assertEquals(BigDecimal.ZERO, summary.getCurrentValue());
        assertEquals(BigDecimal.ZERO, summary.getTotalProfitLoss());
        assertEquals(0.0, summary.getProfitLossPercentage());
        assertEquals(0, summary.getTotalStocks());
        assertEquals(0, summary.getActiveAlerts());
        assertEquals(0, summary.getUnreadNotifications());
    }

    @Test
    void testGetHoldings_PartialSell_CorrectWeightedAverageAndRemainingInvestedValue() {
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));

        com.major.stockportfolio.entity.Stock stock = com.major.stockportfolio.entity.Stock.builder()
                .id(100L)
                .symbol("GOKEX")
                .companyName("Gokaldas Exports")
                .currentPrice(new BigDecimal("420.00"))
                .build();

        com.major.stockportfolio.entity.Portfolio portfolio = com.major.stockportfolio.entity.Portfolio.builder()
                .id(1L)
                .user(testUser)
                .build();

        // Buy 100 @ 500 = 50000
        com.major.stockportfolio.entity.Transaction buyTx = com.major.stockportfolio.entity.Transaction.builder()
                .id(1L)
                .portfolio(portfolio)
                .stock(stock)
                .transactionType("BUY")
                .quantity(100)
                .price(new BigDecimal("500.00"))
                .transactionDate(java.time.LocalDateTime.now().minusDays(5))
                .build();

        // Sell 20 @ 420
        com.major.stockportfolio.entity.Transaction sellTx = com.major.stockportfolio.entity.Transaction.builder()
                .id(2L)
                .portfolio(portfolio)
                .stock(stock)
                .transactionType("SELL")
                .quantity(20)
                .price(new BigDecimal("420.00"))
                .transactionDate(java.time.LocalDateTime.now().minusDays(1))
                .build();

        when(transactionRepository.findByPortfolioUserId(testUser.getId())).thenReturn(java.util.List.of(buyTx, sellTx));

        java.util.List<com.major.stockportfolio.dto.HoldingResponse> holdings = dashboardService.getHoldings();

        assertNotNull(holdings);
        assertEquals(1, holdings.size());

        com.major.stockportfolio.dto.HoldingResponse gokexHolding = holdings.get(0);
        assertEquals("GOKEX", gokexHolding.getSymbol());
        assertEquals(80, gokexHolding.getQuantity());
        // Average buy price MUST remain 500.00 (NOT 50000 / 80 = 625.00)
        assertEquals(500.00, gokexHolding.getAveragePrice(), 0.01);
        // Current price = 420.00
        assertEquals(420.00, gokexHolding.getCurrentPrice(), 0.01);
        // Remaining Invested Value = 80 * 500 = 40,000.00
        assertEquals(40000.00, gokexHolding.getInvestedValue(), 0.01);
        // Remaining Current Value = 80 * 420 = 33,600.00
        assertEquals(33600.00, gokexHolding.getCurrentValue(), 0.01);
        // Unrealized P&L = 33,600 - 40,000 = -6,400.00
        assertEquals(-6400.00, gokexHolding.getProfitLoss(), 0.01);
        // Return % = (-6400 / 40000) * 100 = -16.0%
        assertEquals(-16.0, gokexHolding.getProfitLossPercentage(), 0.01);
    }

    @Test
    void testGetHoldings_FullSell_Excluded() {
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));

        com.major.stockportfolio.entity.Stock stock = com.major.stockportfolio.entity.Stock.builder()
                .id(100L)
                .symbol("TCS")
                .companyName("Tata Consultancy Services")
                .currentPrice(new BigDecimal("3500.00"))
                .build();

        com.major.stockportfolio.entity.Portfolio portfolio = com.major.stockportfolio.entity.Portfolio.builder()
                .id(1L)
                .user(testUser)
                .build();

        // Buy 50 @ 3000
        com.major.stockportfolio.entity.Transaction buyTx = com.major.stockportfolio.entity.Transaction.builder()
                .id(1L)
                .portfolio(portfolio)
                .stock(stock)
                .transactionType("BUY")
                .quantity(50)
                .price(new BigDecimal("3000.00"))
                .build();

        // Sell 50 @ 3500
        com.major.stockportfolio.entity.Transaction sellTx = com.major.stockportfolio.entity.Transaction.builder()
                .id(2L)
                .portfolio(portfolio)
                .stock(stock)
                .transactionType("SELL")
                .quantity(50)
                .price(new BigDecimal("3500.00"))
                .build();

        when(transactionRepository.findByPortfolioUserId(testUser.getId())).thenReturn(java.util.List.of(buyTx, sellTx));

        java.util.List<com.major.stockportfolio.dto.HoldingResponse> holdings = dashboardService.getHoldings();

        assertNotNull(holdings);
        assertTrue(holdings.isEmpty(), "Completely sold positions must be excluded from holdings");
    }
}
