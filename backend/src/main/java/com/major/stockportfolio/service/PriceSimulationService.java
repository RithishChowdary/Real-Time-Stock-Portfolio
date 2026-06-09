package com.major.stockportfolio.service;

import com.major.stockportfolio.entity.Stock;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
public class PriceSimulationService {

    public Double generateSimulatedPrice(
            Stock stock
    ) {

        double currentPrice =
                stock.getCurrentPrice()
                        .doubleValue();

        double randomChange =
                (Math.random() * 20) - 10;

        double simulatedPrice =
                currentPrice + randomChange;

        // PREVENT NEGATIVE PRICE
        if (simulatedPrice < 1) {

            simulatedPrice = 1;
        }

        simulatedPrice =
                BigDecimal.valueOf(simulatedPrice)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        )
                        .doubleValue();

        log.info(
                "Simulated price generated for {} : {}",
                stock.getSymbol(),
                simulatedPrice
        );

        return simulatedPrice;
    }
}