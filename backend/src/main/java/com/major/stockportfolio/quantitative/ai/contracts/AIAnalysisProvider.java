package com.major.stockportfolio.quantitative.ai.contracts;

import com.major.stockportfolio.quantitative.ai.dto.AIAnalysisRequest;
import com.major.stockportfolio.quantitative.ai.dto.AIAnalysisResponse;
import com.major.stockportfolio.quantitative.risk.dto.PortfolioRiskAIResponse;
import com.major.stockportfolio.quantitative.risk.dto.PortfolioRiskMetrics;

public interface AIAnalysisProvider {

    AIAnalysisResponse analyze(AIAnalysisRequest request);

    PortfolioRiskAIResponse analyzePortfolioRisk(PortfolioRiskMetrics metrics);
}
