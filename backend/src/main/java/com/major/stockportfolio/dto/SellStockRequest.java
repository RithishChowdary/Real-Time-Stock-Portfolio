package com.major.stockportfolio.dto;

import lombok.Data;

@Data
public class SellStockRequest {
    private Long portfolioId;
    private String symbol;
    private Integer quantity;
    private Double price;
}