package com.major.stockportfolio.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RecentTransactionResponse {

    private String symbol;
    private String companyName;
    private String transactionType;
    private Integer quantity;
    private Double price;
    private Double totalAmount;
    private LocalDateTime transactionDate;
}