package com.major.stockportfolio.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HoldingResponse {

    private String symbol;
    private String companyName;
    private int quantity;
    private double averagePrice;
    private double currentPrice;
    private double investedValue;
    private double currentValue;
    private double profitLoss;
    private double profitLossPercentage;
}