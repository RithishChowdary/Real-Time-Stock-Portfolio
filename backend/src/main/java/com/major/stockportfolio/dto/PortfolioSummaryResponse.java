package com.major.stockportfolio.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PortfolioSummaryResponse {
    private Double totalInvestment;
    private Double currentValue;
    private Double totalProfitLoss;
    private Double returnPercentage;
}