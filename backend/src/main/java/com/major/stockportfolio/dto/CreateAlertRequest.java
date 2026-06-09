package com.major.stockportfolio.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateAlertRequest {

    private Long userId;
    private Long stockId;

    private BigDecimal targetPrice;
    private BigDecimal stopLoss;

    private Double profitPercentage;
    private Double lossPercentage;
}