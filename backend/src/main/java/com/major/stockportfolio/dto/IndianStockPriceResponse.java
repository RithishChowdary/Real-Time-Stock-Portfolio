package com.major.stockportfolio.dto;

import lombok.Data;

@Data
public class IndianStockPriceResponse {

    private Double currentPrice;
    private Double dayHigh;
    private Double dayLow;
    private Double open;
    private Double previousClose;
    private Double change;
    private Double pChange;
    private String companyName;
    private String symbol;
}