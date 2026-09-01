package com.major.stockportfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioSummaryResponse {
    private Double availableCash;
    private Double totalPortfolioValue;
    private Double totalInvestment;
    private Double currentValue;
    private Double totalProfitLoss;
    private Double returnPercentage;
}