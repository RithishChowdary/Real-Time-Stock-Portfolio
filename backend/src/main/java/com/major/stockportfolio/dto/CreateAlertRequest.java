package com.major.stockportfolio.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAlertRequest {

    private Long userId;

    @NotNull(message = "Stock ID is required")
    private Long stockId;

    @DecimalMin(value = "0.01", message = "Target price must be greater than 0")
    private BigDecimal targetPrice;

    @DecimalMin(value = "0.01", message = "Stop loss must be greater than 0")
    private BigDecimal stopLoss;

    @DecimalMin(value = "0.01", message = "Profit percentage must be greater than 0")
    private Double profitPercentage;

    @DecimalMin(value = "0.01", message = "Loss percentage must be greater than 0")
    private Double lossPercentage;
}