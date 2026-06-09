package com.major.stockportfolio.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StockResearchResponse {

    private Long id;

    private String title;

    private String summary;

    private String pdfUrl;

    private String sourceUrl;

    private LocalDateTime createdAt;

    private String stockSymbol;
}
