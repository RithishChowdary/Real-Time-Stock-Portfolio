package com.major.stockportfolio.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PortfolioRequest {

    @NotBlank(message = "Portfolio name is required")
    private String portfolioName;
}