package com.major.stockportfolio.service;

import com.major.stockportfolio.dto.CreateAlertRequest;
import com.major.stockportfolio.entity.Alert;
import com.major.stockportfolio.entity.Stock;
import com.major.stockportfolio.entity.User;
import com.major.stockportfolio.exception.BadRequestException;
import com.major.stockportfolio.repository.AlertRepository;
import com.major.stockportfolio.repository.NotificationRepository;
import com.major.stockportfolio.repository.StockRepository;
import com.major.stockportfolio.repository.UserRepository;
import com.major.stockportfolio.websocket.AlertPublisher;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlertServiceTest {

    @Mock
    private AlertRepository alertRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StockRepository stockRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private AlertPublisher alertPublisher;

    @InjectMocks
    private AlertService alertService;

    private User testUser;
    private Stock testStock;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .name("Rithish")
                .email("test@example.com")
                .role("USER")
                .build();

        testStock = Stock.builder()
                .id(100L)
                .symbol("TCS")
                .companyName("Tata Consultancy Services")
                .currentPrice(new BigDecimal("2354.50"))
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
    void testCreateAlert_Success() {
        CreateAlertRequest request = CreateAlertRequest.builder()
                .stockId(100L)
                .targetPrice(new BigDecimal("2500.00"))
                .stopLoss(new BigDecimal("2200.00"))
                .build();

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(stockRepository.findById(100L)).thenReturn(Optional.of(testStock));
        when(alertRepository.save(any(Alert.class))).thenAnswer(inv -> {
            Alert a = inv.getArgument(0);
            a.setId(1L);
            return a;
        });

        Alert alert = alertService.createAlert(request);

        assertNotNull(alert);
        assertEquals("TCS", alert.getStock().getSymbol());
        assertEquals(new BigDecimal("2500.00"), alert.getTargetPrice());
        assertEquals(new BigDecimal("2200.00"), alert.getStopLoss());
        assertTrue(alert.getActive());
    }

    @Test
    void testCreateAlert_MissingStockId() {
        CreateAlertRequest request = CreateAlertRequest.builder()
                .targetPrice(new BigDecimal("2500.00"))
                .build();

        assertThrows(BadRequestException.class, () -> alertService.createAlert(request));
    }

    @Test
    void testCreateAlert_NoConditionsProvided() {
        CreateAlertRequest request = CreateAlertRequest.builder()
                .stockId(100L)
                .build();

        assertThrows(BadRequestException.class, () -> alertService.createAlert(request));
    }

    @Test
    void testCreateAlert_NegativeTargetPrice() {
        CreateAlertRequest request = CreateAlertRequest.builder()
                .stockId(100L)
                .targetPrice(new BigDecimal("-100.00"))
                .build();

        assertThrows(BadRequestException.class, () -> alertService.createAlert(request));
    }

    @Test
    void testCreateAlert_ZeroTargetPrice() {
        CreateAlertRequest request = CreateAlertRequest.builder()
                .stockId(100L)
                .targetPrice(BigDecimal.ZERO)
                .build();

        assertThrows(BadRequestException.class, () -> alertService.createAlert(request));
    }

    @Test
    void testCreateAlert_NegativeStopLoss() {
        CreateAlertRequest request = CreateAlertRequest.builder()
                .stockId(100L)
                .stopLoss(new BigDecimal("-50.00"))
                .build();

        assertThrows(BadRequestException.class, () -> alertService.createAlert(request));
    }

    @Test
    void testCreateAlert_ZeroStopLoss() {
        CreateAlertRequest request = CreateAlertRequest.builder()
                .stockId(100L)
                .stopLoss(BigDecimal.ZERO)
                .build();

        assertThrows(BadRequestException.class, () -> alertService.createAlert(request));
    }

    @Test
    void testCreateAlert_NegativePercentages() {
        CreateAlertRequest req1 = CreateAlertRequest.builder()
                .stockId(100L)
                .profitPercentage(-2.0)
                .build();
        assertThrows(BadRequestException.class, () -> alertService.createAlert(req1));

        CreateAlertRequest req2 = CreateAlertRequest.builder()
                .stockId(100L)
                .lossPercentage(-1.5)
                .build();
        assertThrows(BadRequestException.class, () -> alertService.createAlert(req2));
    }
}
