package com.major.stockportfolio.quantitative.ai.contracts;

import com.major.stockportfolio.quantitative.ai.dto.AIAnalysisRequest;
import com.major.stockportfolio.quantitative.ai.dto.AIAnalysisResponse;

public interface AIAnalysisProvider {

    AIAnalysisResponse analyze(AIAnalysisRequest request);
}
