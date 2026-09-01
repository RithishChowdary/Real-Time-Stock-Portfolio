package com.major.stockportfolio.service;

import com.major.stockportfolio.dto.PaperTradingAccountResponse;
import com.major.stockportfolio.entity.PaperTradingAccount;
import com.major.stockportfolio.entity.User;
import com.major.stockportfolio.repository.PaperTradingAccountRepository;
import com.major.stockportfolio.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaperTradingAccountServiceTest {

    @Mock
    private PaperTradingAccountRepository accountRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PaperTradingAccountService accountService;

    private User testUser;
    private PaperTradingAccount testAccount;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .role("USER")
                .build();

        testAccount = PaperTradingAccount.builder()
                .id(10L)
                .user(testUser)
                .availableCash(new BigDecimal("100000.00"))
                .initialBalance(new BigDecimal("100000.00"))
                .build();
    }

    @Test
    void testGetOrCreateAccount_WhenAccountExists() {
        when(accountRepository.findByUser(testUser)).thenReturn(Optional.of(testAccount));

        PaperTradingAccount result = accountService.getOrCreateAccountForUser(testUser);

        assertNotNull(result);
        assertEquals(new BigDecimal("100000.00"), result.getAvailableCash());
        assertEquals(new BigDecimal("100000.00"), result.getInitialBalance());
        verify(accountRepository, never()).save(any(PaperTradingAccount.class));
    }

    @Test
    void testGetOrCreateAccount_WhenAccountDoesNotExist() {
        when(accountRepository.findByUser(testUser)).thenReturn(Optional.empty());
        when(accountRepository.save(any(PaperTradingAccount.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PaperTradingAccount result = accountService.getOrCreateAccountForUser(testUser);

        assertNotNull(result);
        assertEquals(new BigDecimal("100000.00"), result.getAvailableCash());
        assertEquals(new BigDecimal("100000.00"), result.getInitialBalance());
        assertEquals(testUser, result.getUser());
        verify(accountRepository, times(1)).save(any(PaperTradingAccount.class));
    }

    @Test
    void testMapToResponse() {
        PaperTradingAccountResponse response = accountService.mapToResponse(testAccount);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals(1L, response.getUserId());
        assertEquals(new BigDecimal("100000.00"), response.getAvailableCash());
        assertEquals(new BigDecimal("100000.00"), response.getInitialBalance());
    }
}
