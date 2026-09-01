package com.major.stockportfolio.service;

import com.major.stockportfolio.dto.BuyStockRequest;
import com.major.stockportfolio.dto.SellStockRequest;
import com.major.stockportfolio.dto.TransactionResponse;
import com.major.stockportfolio.entity.PaperTradingAccount;
import com.major.stockportfolio.entity.Portfolio;
import com.major.stockportfolio.entity.Stock;
import com.major.stockportfolio.entity.Transaction;
import com.major.stockportfolio.entity.User;
import com.major.stockportfolio.exception.BadRequestException;
import com.major.stockportfolio.exception.UnauthorizedException;
import com.major.stockportfolio.repository.PaperTradingAccountRepository;
import com.major.stockportfolio.repository.PortfolioRepository;
import com.major.stockportfolio.repository.StockRepository;
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
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private PortfolioRepository portfolioRepository;

    @Mock
    private StockRepository stockRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PaperTradingAccountRepository paperTradingAccountRepository;

    @Mock
    private PaperTradingAccountService paperTradingAccountService;

    @InjectMocks
    private TransactionService transactionService;

    private User testUser;
    private User otherUser;
    private Portfolio testPortfolio;
    private Portfolio otherPortfolio;
    private Stock testStock;
    private PaperTradingAccount testAccount;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .name("Rithish")
                .email("rithish@example.com")
                .role("USER")
                .build();

        otherUser = User.builder()
                .id(2L)
                .name("Other")
                .email("other@example.com")
                .role("USER")
                .build();

        testPortfolio = Portfolio.builder()
                .id(100L)
                .portfolioName("Primary Portfolio")
                .user(testUser)
                .build();

        otherPortfolio = Portfolio.builder()
                .id(200L)
                .portfolioName("Other Portfolio")
                .user(otherUser)
                .build();

        testStock = Stock.builder()
                .id(10L)
                .symbol("TCS")
                .companyName("Tata Consultancy Services")
                .currentPrice(new BigDecimal("2354.50"))
                .build();

        testAccount = PaperTradingAccount.builder()
                .id(50L)
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

    // 1. Successful BUY
    @Test
    void testSuccessfulBuy() {
        BuyStockRequest request = BuyStockRequest.builder()
                .portfolioId(100L)
                .symbol("TCS")
                .quantity(10)
                .price(2354.50)
                .build();

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(portfolioRepository.findById(100L)).thenReturn(Optional.of(testPortfolio));
        when(stockRepository.findBySymbol("TCS")).thenReturn(Optional.of(testStock));
        when(paperTradingAccountRepository.findByUserIdForUpdate(testUser.getId())).thenReturn(Optional.of(testAccount));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
            Transaction tx = invocation.getArgument(0);
            tx.setId(999L);
            return tx;
        });

        TransactionResponse response = transactionService.buyStock(request);

        assertNotNull(response);
        assertEquals("TCS", response.getSymbol());
        assertEquals(10, response.getQuantity());
        assertEquals(2354.50, response.getPrice());
        assertEquals("BUY", response.getTransactionType());
        // Verify cash deduction: 100,000 - (10 * 2354.50 = 23,545.00) = 76,455.00
        assertEquals(new BigDecimal("76455.00"), testAccount.getAvailableCash());
        verify(paperTradingAccountRepository, times(1)).save(testAccount);
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    // 2. Successful SELL
    @Test
    void testSuccessfulSell() {
        SellStockRequest request = SellStockRequest.builder()
                .portfolioId(100L)
                .symbol("TCS")
                .quantity(5)
                .price(2400.00)
                .build();

        Transaction buyTx = Transaction.builder()
                .id(1L)
                .portfolio(testPortfolio)
                .stock(testStock)
                .quantity(10)
                .price(new BigDecimal("2354.50"))
                .transactionType("BUY")
                .transactionDate(LocalDateTime.now().minusDays(1))
                .build();

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(portfolioRepository.findById(100L)).thenReturn(Optional.of(testPortfolio));
        when(stockRepository.findBySymbol("TCS")).thenReturn(Optional.of(testStock));
        when(transactionRepository.findByPortfolioId(100L)).thenReturn(List.of(buyTx));
        when(paperTradingAccountRepository.findByUserIdForUpdate(testUser.getId())).thenReturn(Optional.of(testAccount));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
            Transaction tx = invocation.getArgument(0);
            tx.setId(1000L);
            return tx;
        });

        TransactionResponse response = transactionService.sellStock(request);

        assertNotNull(response);
        assertEquals("TCS", response.getSymbol());
        assertEquals(5, response.getQuantity());
        assertEquals(2400.00, response.getPrice());
        assertEquals("SELL", response.getTransactionType());
        // Verify cash increase: 100,000 + (5 * 2400.00 = 12,000.00) = 112,000.00
        assertEquals(new BigDecimal("112000.00"), testAccount.getAvailableCash());
        verify(paperTradingAccountRepository, times(1)).save(testAccount);
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    // 3. BUY with insufficient funds
    @Test
    void testBuyWithInsufficientFunds() {
        testAccount.setAvailableCash(new BigDecimal("5000.00"));

        BuyStockRequest request = BuyStockRequest.builder()
                .portfolioId(100L)
                .symbol("TCS")
                .quantity(10)
                .price(2354.50) // requires 23,545.00
                .build();

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(portfolioRepository.findById(100L)).thenReturn(Optional.of(testPortfolio));
        when(stockRepository.findBySymbol("TCS")).thenReturn(Optional.of(testStock));
        when(paperTradingAccountRepository.findByUserIdForUpdate(testUser.getId())).thenReturn(Optional.of(testAccount));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> transactionService.buyStock(request));
        assertTrue(ex.getMessage().contains("Insufficient funds"));

        // Cash unmodified
        assertEquals(new BigDecimal("5000.00"), testAccount.getAvailableCash());
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    // 4. SELL with insufficient holdings
    @Test
    void testSellWithInsufficientHoldings() {
        SellStockRequest request = SellStockRequest.builder()
                .portfolioId(100L)
                .symbol("TCS")
                .quantity(15) // user only has 10
                .price(2400.00)
                .build();

        Transaction buyTx = Transaction.builder()
                .id(1L)
                .portfolio(testPortfolio)
                .stock(testStock)
                .quantity(10)
                .price(new BigDecimal("2354.50"))
                .transactionType("BUY")
                .transactionDate(LocalDateTime.now().minusDays(1))
                .build();

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(portfolioRepository.findById(100L)).thenReturn(Optional.of(testPortfolio));
        when(stockRepository.findBySymbol("TCS")).thenReturn(Optional.of(testStock));
        when(transactionRepository.findByPortfolioId(100L)).thenReturn(List.of(buyTx));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> transactionService.sellStock(request));
        assertTrue(ex.getMessage().contains("Insufficient holdings"));
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    // 5. Zero quantity rejected (BUY & SELL)
    @Test
    void testZeroQuantityRejected() {
        BuyStockRequest buyReq = BuyStockRequest.builder()
                .portfolioId(100L)
                .symbol("TCS")
                .quantity(0)
                .price(2000.0)
                .build();

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(portfolioRepository.findById(100L)).thenReturn(Optional.of(testPortfolio));

        assertThrows(BadRequestException.class, () -> transactionService.buyStock(buyReq));

        SellStockRequest sellReq = SellStockRequest.builder()
                .portfolioId(100L)
                .symbol("TCS")
                .quantity(0)
                .price(2000.0)
                .build();

        assertThrows(BadRequestException.class, () -> transactionService.sellStock(sellReq));
    }

    // 6. Negative quantity rejected
    @Test
    void testNegativeQuantityRejected() {
        BuyStockRequest buyReq = BuyStockRequest.builder()
                .portfolioId(100L)
                .symbol("TCS")
                .quantity(-5)
                .price(2000.0)
                .build();

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(portfolioRepository.findById(100L)).thenReturn(Optional.of(testPortfolio));

        assertThrows(BadRequestException.class, () -> transactionService.buyStock(buyReq));
    }

    // 7. Zero price rejected
    @Test
    void testZeroPriceRejected() {
        BuyStockRequest buyReq = BuyStockRequest.builder()
                .portfolioId(100L)
                .symbol("TCS")
                .quantity(5)
                .price(0.0)
                .build();

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(portfolioRepository.findById(100L)).thenReturn(Optional.of(testPortfolio));

        assertThrows(BadRequestException.class, () -> transactionService.buyStock(buyReq));
    }

    // 8. Negative price rejected
    @Test
    void testNegativePriceRejected() {
        BuyStockRequest buyReq = BuyStockRequest.builder()
                .portfolioId(100L)
                .symbol("TCS")
                .quantity(5)
                .price(-100.0)
                .build();

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(portfolioRepository.findById(100L)).thenReturn(Optional.of(testPortfolio));

        assertThrows(BadRequestException.class, () -> transactionService.buyStock(buyReq));
    }

    // 9. User cannot trade another user's portfolio
    @Test
    void testUserCannotTradeAnotherUsersPortfolio() {
        BuyStockRequest buyReq = BuyStockRequest.builder()
                .portfolioId(200L)
                .symbol("TCS")
                .quantity(5)
                .price(2000.0)
                .build();

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(portfolioRepository.findById(200L)).thenReturn(Optional.of(otherPortfolio));

        assertThrows(UnauthorizedException.class, () -> transactionService.buyStock(buyReq));
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    // 10. Failed BUY does not modify cash
    @Test
    void testFailedBuyDoesNotModifyCash() {
        testAccount.setAvailableCash(new BigDecimal("10000.00"));

        BuyStockRequest request = BuyStockRequest.builder()
                .portfolioId(100L)
                .symbol("TCS")
                .quantity(10)
                .price(2354.50) // 23,545.00 > 10,000.00
                .build();

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(portfolioRepository.findById(100L)).thenReturn(Optional.of(testPortfolio));
        when(stockRepository.findBySymbol("TCS")).thenReturn(Optional.of(testStock));
        when(paperTradingAccountRepository.findByUserIdForUpdate(testUser.getId())).thenReturn(Optional.of(testAccount));

        assertThrows(BadRequestException.class, () -> transactionService.buyStock(request));
        assertEquals(new BigDecimal("10000.00"), testAccount.getAvailableCash());
    }

    // 11. Failed SELL does not modify cash
    @Test
    void testFailedSellDoesNotModifyCash() {
        SellStockRequest request = SellStockRequest.builder()
                .portfolioId(100L)
                .symbol("TCS")
                .quantity(5)
                .price(2000.0)
                .build();

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(portfolioRepository.findById(100L)).thenReturn(Optional.of(testPortfolio));
        when(stockRepository.findBySymbol("TCS")).thenReturn(Optional.of(testStock));
        when(transactionRepository.findByPortfolioId(100L)).thenReturn(Collections.emptyList()); // 0 holdings

        assertThrows(BadRequestException.class, () -> transactionService.sellStock(request));
        assertEquals(new BigDecimal("100000.00"), testAccount.getAvailableCash());
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    // 12. Portfolio Summary for Empty Portfolio
    @Test
    void testPortfolioSummary_EmptyPortfolio() {
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(portfolioRepository.findById(100L)).thenReturn(Optional.of(testPortfolio));
        when(transactionRepository.findByPortfolioId(100L)).thenReturn(Collections.emptyList());
        when(paperTradingAccountRepository.findByUserId(testUser.getId())).thenReturn(Optional.of(testAccount));

        var summary = transactionService.getPortfolioSummary(100L);

        assertNotNull(summary);
        assertEquals(100000.0, summary.getAvailableCash());
        assertEquals(100000.0, summary.getTotalPortfolioValue());
        assertEquals(0.0, summary.getTotalInvestment());
        assertEquals(0.0, summary.getCurrentValue());
        assertEquals(0.0, summary.getTotalProfitLoss());
        assertEquals(0.0, summary.getReturnPercentage());
    }

    // 13. Portfolio Summary with Active Holdings
    @Test
    void testPortfolioSummary_WithHoldings() {
        Transaction buyTx = Transaction.builder()
                .id(1L)
                .portfolio(testPortfolio)
                .stock(testStock)
                .quantity(10)
                .price(new BigDecimal("2000.00")) // Invested = 20,000.00
                .transactionType("BUY")
                .transactionDate(LocalDateTime.now().minusDays(1))
                .build();

        // Current price of testStock = 2354.50 -> Current Value = 23,545.00
        // Profit = 3,545.00, Return = (3545 / 20000) * 100 = 17.725%
        testAccount.setAvailableCash(new BigDecimal("80000.00")); // Cash remaining

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(portfolioRepository.findById(100L)).thenReturn(Optional.of(testPortfolio));
        when(transactionRepository.findByPortfolioId(100L)).thenReturn(List.of(buyTx));
        when(paperTradingAccountRepository.findByUserId(testUser.getId())).thenReturn(Optional.of(testAccount));

        var summary = transactionService.getPortfolioSummary(100L);

        assertNotNull(summary);
        assertEquals(80000.0, summary.getAvailableCash());
        assertEquals(20000.0, summary.getTotalInvestment());
        assertEquals(23545.0, summary.getCurrentValue());
        assertEquals(3545.0, summary.getTotalProfitLoss());
        assertEquals(17.725, summary.getReturnPercentage(), 0.001);
        assertEquals(103545.0, summary.getTotalPortfolioValue()); // 80,000 + 23,545
    }
}
