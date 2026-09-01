package com.major.stockportfolio.quantitative.dto.api;

import com.major.stockportfolio.quantitative.report.PerformanceMetrics;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BacktestResponse {

    private String symbol;
    private String strategy;
    private PerformanceMetrics performanceMetrics;

    public BacktestResponse(String symbol, PerformanceMetrics performanceMetrics) {
        this.symbol = symbol;
        this.strategy = "EMA_RSI";
        this.performanceMetrics = performanceMetrics;
    }
}
