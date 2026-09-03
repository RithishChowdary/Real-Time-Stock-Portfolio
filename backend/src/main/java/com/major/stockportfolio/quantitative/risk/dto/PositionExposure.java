package com.major.stockportfolio.quantitative.risk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionExposure {

    private String symbol;
    private String companyName;
    private int quantity;
    private BigDecimal averagePrice;
    private BigDecimal currentPrice;
    private BigDecimal investedValue;
    private BigDecimal currentValue;
    private BigDecimal profitLoss;
    private double returnPercentage;
    private double exposurePercentage;
}
