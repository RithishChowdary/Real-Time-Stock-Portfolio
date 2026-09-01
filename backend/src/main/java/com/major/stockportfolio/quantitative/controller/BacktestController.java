package com.major.stockportfolio.quantitative.controller;

import com.major.stockportfolio.quantitative.ai.dto.AIAnalysisRequest;
import com.major.stockportfolio.quantitative.ai.dto.AIAnalysisResponse;
import com.major.stockportfolio.quantitative.ai.service.AIAnalysisService;
import com.major.stockportfolio.quantitative.dto.api.BacktestRequest;
import com.major.stockportfolio.quantitative.dto.api.BacktestResponse;
import com.major.stockportfolio.quantitative.dto.api.WalkForwardBacktestResponse;
import com.major.stockportfolio.quantitative.service.impl.BacktestApiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/backtest")
@RequiredArgsConstructor
public class BacktestController {

    private final BacktestApiService backtestApiService;
    private final AIAnalysisService aiAnalysisService;

    @PostMapping
    public ResponseEntity<BacktestResponse> runBacktest(
            @RequestBody BacktestRequest request) {

        BacktestResponse response =
                backtestApiService.execute(request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/walk-forward")
    public ResponseEntity<WalkForwardBacktestResponse> runWalkForwardBacktest(
            @RequestBody BacktestRequest request) {

        WalkForwardBacktestResponse response =
                backtestApiService.executeWalkForward(request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/analysis")
    public ResponseEntity<AIAnalysisResponse> analyzeBacktest(
            @Valid @RequestBody AIAnalysisRequest request) {

        AIAnalysisResponse response =
                aiAnalysisService.analyze(request);

        return ResponseEntity.ok(response);
    }
}
