package com.major.stockportfolio.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StockResearchRequest {

    private Long stockId;

    private String title;

    private String summary;

    private String sourceUrl;
}
