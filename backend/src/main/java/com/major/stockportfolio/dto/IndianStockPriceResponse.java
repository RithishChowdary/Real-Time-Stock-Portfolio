package com.major.stockportfolio.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class IndianStockPriceResponse {

    private String symbol;

    @JsonProperty("name")
    private String companyName;

    @JsonProperty("price")
    private Double currentPrice;
}