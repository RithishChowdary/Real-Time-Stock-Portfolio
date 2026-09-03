package com.major.stockportfolio.quantitative.risk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioRiskAnalysisResponse {

    private PortfolioRiskMetrics metrics;
    private PortfolioRiskAIResponse aiAssessment;
    private LocalDateTime analyzedAt;
}
