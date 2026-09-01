package com.major.stockportfolio.quantitative.report;

import java.util.Objects;

import org.springframework.stereotype.Component;
import org.ta4j.core.BarSeries;
import org.ta4j.core.Position;
import org.ta4j.core.TradingRecord;

/**
 * Calculates the evaluation profit of a trading record.
 *
 * <p>
 * Completed positions contribute realized profit/loss.
 * An open position is valued at the final close price of the
 * supplied BarSeries so that optimization can evaluate strategies
 * that have not yet generated an exit signal.
 * </p>
 */
@Component
public class TradingProfitCalculator {

    /**
     * Calculates realized + unrealized profit/loss.
     *
     * @param series bar series used for the backtest
     * @param tradingRecord trading record produced by TA4J
     * @return total evaluation profit/loss
     */
    public double calculate(
            BarSeries series,
            TradingRecord tradingRecord) {

        Objects.requireNonNull(
                series,
                "BarSeries must not be null"
        );

        Objects.requireNonNull(
                tradingRecord,
                "TradingRecord must not be null"
        );

        if (series.isEmpty()) {
            throw new IllegalArgumentException(
                    "BarSeries must contain at least one bar"
            );
        }

        double totalProfit = 0.0;

        /*
         * Completed positions.
         */
        for (Position position : tradingRecord.getPositions()) {

            if (position == null
                    || position.getEntry() == null) {
                continue;
            }

            if (position.getExit() != null) {

                totalProfit +=
                        position.getProfit()
                                .doubleValue();

            } else {

                /*
                 * Position is still open.
                 *
                 * Value it using the final closing price
                 * of the supplied series.
                 */
                double entryPrice =
                        position.getEntry()
                                .getPricePerAsset()
                                .doubleValue();

                double finalClosePrice =
                        series.getLastBar()
                                .getClosePrice()
                                .doubleValue();

                double quantity =
                        position.getEntry()
                                .getAmount()
                                .doubleValue();

                totalProfit +=
                        (finalClosePrice - entryPrice)
                                * quantity;
            }
        }

        return totalProfit;
    }
}