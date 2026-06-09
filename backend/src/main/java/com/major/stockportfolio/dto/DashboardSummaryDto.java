package com.major.stockportfolio.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDto {

    private BigDecimal totalInvestment;
    private BigDecimal currentValue;
    private BigDecimal totalProfitLoss;
    private Double profitLossPercentage;

    private Integer totalStocks;
    private Integer activeAlerts;
    private Integer unreadNotifications;
}