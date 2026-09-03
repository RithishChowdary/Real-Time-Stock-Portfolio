package com.major.stockportfolio.quantitative.risk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioRiskAIResponse {

    private String executiveSummary;
    private String riskAssessment;
    private String exposureAnalysis;
    private String concentrationAnalysis;

    @Builder.Default
    private List<String> strengths = new ArrayList<>();

    @Builder.Default
    private List<String> areasOfConcern = new ArrayList<>();

    @Builder.Default
    private List<String> recommendedReviewAreas = new ArrayList<>();

    private String educationalDisclaimer;
    private LocalDateTime generatedAt;
}
