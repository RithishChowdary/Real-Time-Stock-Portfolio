package com.major.stockportfolio.quantitative.dto.api;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BacktestRequest {

    private String symbol;
    private String strategy;
    private Double initialCapital;

    public BacktestRequest(String symbol) {
        this.symbol = symbol;
        this.strategy = "EMA_RSI";
        this.initialCapital = 100000.0;
    }

    public BacktestRequest(String symbol, String strategy) {
        this.symbol = symbol;
        this.strategy = strategy;
        this.initialCapital = 100000.0;
    }
}
