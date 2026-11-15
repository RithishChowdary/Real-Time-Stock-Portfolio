package com.major.stockportfolio.quantitative.engine;

import java.time.Instant;
import java.util.Objects;

/**
 * Immutable account state marked to the close of one backtest bar.
 */
public final class AccountSnapshot {

    private final int barIndex;
    private final Instant timestamp;
    private final double availableCash;
    private final long holdingsQuantity;
    private final double costBasis;
    private final double realizedPnl;
    private final double unrealizedPnl;
    private final double holdingsMarketValue;
    private final double equity;

    public AccountSnapshot(
            int barIndex,
            Instant timestamp,
            double availableCash,
            long holdingsQuantity,
            double costBasis,
            double realizedPnl,
            double unrealizedPnl,
            double holdingsMarketValue,
            double equity) {
        this.barIndex = barIndex;
        this.timestamp = Objects.requireNonNull(timestamp, "Timestamp must not be null");
        this.availableCash = availableCash;
        this.holdingsQuantity = holdingsQuantity;
        this.costBasis = costBasis;
        this.realizedPnl = realizedPnl;
        this.unrealizedPnl = unrealizedPnl;
        this.holdingsMarketValue = holdingsMarketValue;
        this.equity = equity;
    }

    public int getBarIndex() {
        return barIndex;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public double getAvailableCash() {
        return availableCash;
    }

    public long getHoldingsQuantity() {
        return holdingsQuantity;
    }

    /**
     * Total purchase cost of the currently held shares.
     */
    public double getCostBasis() {
        return costBasis;
    }

    public double getRealizedPnl() {
        return realizedPnl;
    }

    public double getUnrealizedPnl() {
        return unrealizedPnl;
    }

    public double getHoldingsMarketValue() {
        return holdingsMarketValue;
    }

    public double getEquity() {
        return equity;
    }
}
