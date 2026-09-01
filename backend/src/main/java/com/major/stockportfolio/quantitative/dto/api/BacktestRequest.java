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

    public BacktestRequest(String symbol) {
        this.symbol = symbol;
        this.strategy = "EMA_RSI";
    }
}
