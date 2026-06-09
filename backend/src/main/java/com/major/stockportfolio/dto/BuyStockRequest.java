package com.major.stockportfolio.dto;

import lombok.Data;

@Data
public class BuyStockRequest {
    private Long portfolioId;
    private String symbol;
    private Integer quantity;
    private Double price;
}