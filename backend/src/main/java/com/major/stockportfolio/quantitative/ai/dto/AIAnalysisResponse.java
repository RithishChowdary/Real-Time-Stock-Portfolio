package com.major.stockportfolio.quantitative.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIAnalysisResponse {

    private String symbol;
    private String strategy;
    private String summary;
    private String performanceAnalysis;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> riskObservations;
    private String marketBehavior;
    private String interpretation;
    private LocalDateTime generatedAt;
}
