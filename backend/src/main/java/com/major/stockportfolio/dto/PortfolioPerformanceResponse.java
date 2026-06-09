package com.major.stockportfolio.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class PortfolioPerformanceResponse {

    private LocalDate date;

    private Double portfolioValue;
}