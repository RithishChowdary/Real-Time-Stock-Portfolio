package com.major.stockportfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockResearchRequest {

    private Long stockId;

    private String title;

    private String summary;

    private String sourceUrl;
}
