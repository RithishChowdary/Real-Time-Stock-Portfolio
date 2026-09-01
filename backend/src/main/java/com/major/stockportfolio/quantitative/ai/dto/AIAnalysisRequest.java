package com.major.stockportfolio.quantitative.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIAnalysisRequest {

    @NotBlank(message = "Stock symbol is required")
    private String symbol;

    @NotBlank(message = "Strategy name is required")
    private String strategy;

    private int totalTrades;
    private int winningTrades;
    private int losingTrades;
    private double winRate;
    private double totalProfit;
    private double totalLoss;
    private double totalEarnings;
    private double averageProfit;
    private double maximumDrawdown;
    private double profitFactor;
}
