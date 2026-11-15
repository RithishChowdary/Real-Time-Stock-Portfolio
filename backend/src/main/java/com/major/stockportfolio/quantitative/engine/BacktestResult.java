package com.major.stockportfolio.quantitative.engine;

import java.util.List;
import java.util.Objects;

import org.ta4j.core.TradingRecord;

/**
 * Trading record and account snapshots produced by a capital-aware backtest.
 */
public final class BacktestResult {

    private final TradingRecord tradingRecord;
    private final List<AccountSnapshot> accountSnapshots;

    public BacktestResult(
            TradingRecord tradingRecord,
            List<AccountSnapshot> accountSnapshots) {
        this.tradingRecord =
                Objects.requireNonNull(tradingRecord, "TradingRecord must not be null");
        this.accountSnapshots =
                List.copyOf(Objects.requireNonNull(accountSnapshots, "Snapshots must not be null"));
    }

    public TradingRecord getTradingRecord() {
        return tradingRecord;
    }

    public List<AccountSnapshot> getAccountSnapshots() {
        return accountSnapshots;
    }

    public double getFinalEquity() {
        if (accountSnapshots.isEmpty()) {
            throw new IllegalStateException(
                    "Backtest result has no account snapshots"
            );
        }
        return accountSnapshots.get(accountSnapshots.size() - 1).getEquity();
    }
}
