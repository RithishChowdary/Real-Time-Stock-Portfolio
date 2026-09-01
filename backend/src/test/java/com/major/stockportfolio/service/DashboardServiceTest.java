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
}
