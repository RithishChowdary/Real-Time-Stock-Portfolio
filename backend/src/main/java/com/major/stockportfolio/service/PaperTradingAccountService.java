package com.major.stockportfolio.service;

import com.major.stockportfolio.dto.PaperTradingAccountResponse;
import com.major.stockportfolio.entity.PaperTradingAccount;
import com.major.stockportfolio.entity.User;
import com.major.stockportfolio.exception.ResourceNotFoundException;
import com.major.stockportfolio.repository.PaperTradingAccountRepository;
import com.major.stockportfolio.repository.UserRepository;
import com.major.stockportfolio.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaperTradingAccountService {

    private final PaperTradingAccountRepository accountRepository;
    private final UserRepository userRepository;

    @Transactional
    public PaperTradingAccount getOrCreateAccountForUser(User user) {
        return accountRepository.findByUser(user)
                .orElseGet(() -> {
                    log.info("Initializing ₹1,00,000 paper trading account for user: {}", user.getEmail());
                    PaperTradingAccount newAccount = PaperTradingAccount.builder()
                            .user(user)
                            .initialBalance(PaperTradingAccount.DEFAULT_INITIAL_BALANCE)
                            .availableCash(PaperTradingAccount.DEFAULT_INITIAL_BALANCE)
                            .build();
                    return accountRepository.save(newAccount);
                });
    }

    @Transactional
    public PaperTradingAccountResponse getMyAccount() {
        User user = getCurrentUser();
        PaperTradingAccount account = getOrCreateAccountForUser(user);
        return mapToResponse(account);
    }

    @Transactional
    public PaperTradingAccount getAccountForCurrentUser() {
        User user = getCurrentUser();
        return getOrCreateAccountForUser(user);
    }

    @Transactional
    public PaperTradingAccountResponse resetAccount() {
        User user = getCurrentUser();
        PaperTradingAccount account = getOrCreateAccountForUser(user);
        account.setAvailableCash(account.getInitialBalance());
        PaperTradingAccount saved = accountRepository.save(account);
        log.info("Reset paper trading cash balance to {} for user {}", saved.getAvailableCash(), user.getEmail());
        return mapToResponse(saved);
    }

    public PaperTradingAccountResponse mapToResponse(PaperTradingAccount account) {
        return PaperTradingAccountResponse.builder()
                .id(account.getId())
                .userId(account.getUser().getId())
                .availableCash(account.getAvailableCash())
                .initialBalance(account.getInitialBalance())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }

    private User getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }
}
