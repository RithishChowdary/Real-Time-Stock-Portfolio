package com.major.stockportfolio.controller;

import com.major.stockportfolio.dto.PaperTradingAccountResponse;
import com.major.stockportfolio.service.PaperTradingAccountService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/account")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class PaperTradingAccountController {

    private final PaperTradingAccountService accountService;

    @GetMapping
    public ResponseEntity<PaperTradingAccountResponse> getAccount() {
        return ResponseEntity.ok(accountService.getMyAccount());
    }

    @GetMapping("/balance")
    public ResponseEntity<PaperTradingAccountResponse> getBalance() {
        return ResponseEntity.ok(accountService.getMyAccount());
    }

    @PostMapping("/reset")
    public ResponseEntity<PaperTradingAccountResponse> resetAccount() {
        return ResponseEntity.ok(accountService.resetAccount());
    }
}
