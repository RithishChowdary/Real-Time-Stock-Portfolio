package com.major.stockportfolio.quantitative.risk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioRiskMetrics {

    private BigDecimal totalPortfolioValue;
    private BigDecimal availableCash;
    private BigDecimal holdingsValue;
    private BigDecimal totalInvestment;
    private BigDecimal profitLoss;
    private double returnPercentage;

    private int numberOfHoldings;
    private String largestHoldingSymbol;
    private BigDecimal largestHoldingValue;
    private double largestHoldingPercentage;
    private double cashAllocationPercentage;

    private int riskScore; // Deterministic educational score: 0 to 100
    private String riskLevel; // LOW, MODERATE, HIGH, VERY HIGH

    @Builder.Default
    private List<String> riskFactors = new ArrayList<>();

    @Builder.Default
    private List<PositionExposure> positionExposures = new ArrayList<>();

    private LocalDateTime calculatedAt;
}
