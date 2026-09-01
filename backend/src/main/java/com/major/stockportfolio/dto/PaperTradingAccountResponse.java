package com.major.stockportfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaperTradingAccountResponse {

    private Long id;
    private Long userId;
    private BigDecimal availableCash;
    private BigDecimal initialBalance;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
