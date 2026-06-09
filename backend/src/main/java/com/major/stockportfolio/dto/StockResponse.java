package com.major.stockportfolio.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class StockResponse {
    private Long id;
    private String symbol;
    private String companyName;
    private BigDecimal currentPrice;
    private LocalDateTime lastUpdated;
}
