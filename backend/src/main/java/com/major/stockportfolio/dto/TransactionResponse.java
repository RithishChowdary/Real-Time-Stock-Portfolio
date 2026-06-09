package com.major.stockportfolio.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TransactionResponse {
    private Long id;
    private String symbol;
    private String companyName;
    private Integer quantity;
    private Double price;
    private String transactionType;
    private LocalDateTime transactionDate;
}