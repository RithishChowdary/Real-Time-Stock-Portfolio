package com.major.stockportfolio.quantitative.engine;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

import com.major.stockportfolio.quantitative.exceptions.BacktestExecutionException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.ta4j.core.Bar;
import org.ta4j.core.BarSeries;
import org.ta4j.core.BaseTradingRecord;
import org.ta4j.core.Position;
import org.ta4j.core.Strategy;
import org.ta4j.core.TradingRecord;
import org.ta4j.core.num.Num;

/**
 * Executes TA4J strategy signals against a historical bar series using
 * long-only, whole-share position sizing and an initial cash balance.
 *
 * <p>Signals are evaluated on each bar and filled at the next bar's open.
 * Fees and slippage are not modeled.</p>
 */
@Component
@Slf4j
public class BacktestEngine {

    public static final double DEFAULT_INITIAL_CAPITAL = 100000.0;

    /**
     * Preserves the original API while applying the default backtest capital.
     */
    public TradingRecord run(
            BarSeries series,
            Strategy strategy) {
        return runWithAccount(series, strategy, DEFAULT_INITIAL_CAPITAL)
                .getTradingRecord();
    }

    /**
     * Executes a backtest with caller-provided starting capital.
     */
    public TradingRecord run(
            BarSeries series,
            Strategy strategy,
            double initialCapital) {
        return runWithAccount(series, strategy, initialCapital)
                .getTradingRecord();
    }

    public BacktestResult runWithAccount(
            BarSeries series,
            Strategy strategy) {
        return runWithAccount(series, strategy, DEFAULT_INITIAL_CAPITAL);
    }

    /**
     * Executes the TA4J strategy and returns its trading record together with
     * account snapshots captured at every bar close.
     */
    public BacktestResult runWithAccount(
            BarSeries series,
            Strategy strategy,
            double initialCapital) {
        return runWithAccountInternal(
                series,
                strategy,
                initialCapital,
                null
        );
    }

    /**
     * Executes a backtest while using earlier bars only as indicator warm-up.
     * Signals are considered starting at {@code firstSignalIndex}; any signal
     * is still filled at the following bar's open.
     */
    public BacktestResult runWithAccount(
            BarSeries series,
            Strategy strategy,
            double initialCapital,
            int firstSignalIndex) {
        return runWithAccountInternal(
                series,
                strategy,
                initialCapital,
                firstSignalIndex
        );
    }

    private BacktestResult runWithAccountInternal(
            BarSeries series,
            Strategy strategy,
            double initialCapital,
            Integer firstSignalIndex) {

        validate(series, strategy, initialCapital);
        int signalStartIndex = firstSignalIndex == null
                ? series.getBeginIndex()
                : firstSignalIndex;
        if (signalStartIndex < series.getBeginIndex()
                || signalStartIndex > series.getEndIndex()) {
            throw new IllegalArgumentException(
                    "First signal index must be within the bar series"
            );
        }

        log.info(
                "Starting capital-aware backtest. Series: {}, bars: {}, initial capital: {}",
                series.getName(),
                series.getBarCount(),
                initialCapital
        );

        try {
            TradingRecord tradingRecord = new BaseTradingRecord();
            AccountLedger ledger = new AccountLedger(initialCapital);
            List<AccountSnapshot> snapshots = new ArrayList<>(series.getBarCount());

            PendingTrade pendingTrade = null;
            int beginIndex = series.getBeginIndex();
            int endIndex = series.getEndIndex();

            for (int index = beginIndex; index <= endIndex; index++) {
                Bar bar = series.getBar(index);

                if (pendingTrade != null) {
                    executePendingTrade(
                            pendingTrade,
                            index,
                            bar.getOpenPrice(),
                            series,
                            tradingRecord,
                            ledger
                    );
                    pendingTrade = null;
                }

                snapshots.add(ledger.snapshot(index, bar));

                if (index >= signalStartIndex
                        && strategy.shouldOperate(index, tradingRecord)
                        && index < endIndex) {
                    Position currentPosition = tradingRecord.getCurrentPosition();
                    if (currentPosition.isNew()) {
                        pendingTrade = PendingTrade.ENTRY;
                    } else if (currentPosition.isOpened()) {
                        pendingTrade = PendingTrade.EXIT;
                    } else {
                        throw new IllegalStateException(
                                "Strategy requested an operation while the current position is neither new nor open"
                        );
                    }
                }
            }

            BacktestResult result = new BacktestResult(tradingRecord, snapshots);
            log.info(
                    "Backtest completed. Completed positions: {}, open position: {}, final equity: {}",
                    tradingRecord.getPositionCount(),
                    tradingRecord.getCurrentPosition().isOpened(),
                    result.getFinalEquity()
            );
            return result;

        } catch (RuntimeException e) {
            log.error(
                    "Backtest execution failed for series: {}",
                    series.getName(),
                    e
            );

            throw new BacktestExecutionException(
                    "Failed to execute backtest",
                    e
            );
        }
    }

    private void executePendingTrade(
            PendingTrade pendingTrade,
            int index,
            Num executionPrice,
            BarSeries series,
            TradingRecord tradingRecord,
            AccountLedger ledger) {

        BigDecimal price = positivePrice(executionPrice, index);

        if (pendingTrade == PendingTrade.ENTRY) {
            long quantity = ledger.affordableWholeShares(price);
            if (quantity == 0) {
                log.info(
                        "Skipping entry at index {}: available cash {} cannot afford one share at {}",
                        index,
                        ledger.cash(),
                        price
                );
                return;
            }

            Num amount = series.numFactory().numOf(quantity);
            if (!tradingRecord.enter(index, executionPrice, amount)) {
                throw new IllegalStateException(
                        "TradingRecord rejected entry at index " + index
                );
            }
            ledger.buy(quantity, price);
            return;
        }

        Position position = tradingRecord.getCurrentPosition();
        if (position == null || !position.isOpened()) {
            throw new IllegalStateException(
                    "Cannot execute exit without an open position at index " + index
            );
        }

        long quantity = position.getEntry().getAmount().longValue();
        if (quantity <= 0) {
            throw new IllegalStateException(
                    "Open position has an invalid share quantity at index " + index
            );
        }

        Num amount = series.numFactory().numOf(quantity);
        if (!tradingRecord.exit(index, executionPrice, amount)) {
            throw new IllegalStateException(
                    "TradingRecord rejected exit at index " + index
            );
        }
        ledger.sell(quantity, price);
    }

    private BigDecimal positivePrice(Num price, int index) {
        double value = price.doubleValue();
        if (!Double.isFinite(value) || value <= 0.0) {
            throw new IllegalArgumentException(
                    "Execution price must be finite and positive at index "
                            + index + ", found " + value
            );
        }
        return BigDecimal.valueOf(value);
    }

    private void validate(
            BarSeries series,
            Strategy strategy,
            double initialCapital) {

        if (series == null) {
            throw new IllegalArgumentException(
                    "BarSeries must not be null"
            );
        }

        if (series.isEmpty()) {
            throw new IllegalArgumentException(
                    "BarSeries must contain at least one bar"
            );
        }

        if (strategy == null) {
            throw new IllegalArgumentException(
                    "Strategy must not be null"
            );
        }

        if (!Double.isFinite(initialCapital) || initialCapital <= 0.0) {
            throw new IllegalArgumentException(
                    "Initial capital must be finite and greater than zero"
            );
        }
    }

    private enum PendingTrade {
        ENTRY,
        EXIT
    }

    private static final class AccountLedger {

        private BigDecimal availableCash;
        private long holdingsQuantity;
        private BigDecimal costBasis = BigDecimal.ZERO;
        private BigDecimal realizedPnl = BigDecimal.ZERO;

        private AccountLedger(double initialCapital) {
            this.availableCash = BigDecimal.valueOf(initialCapital);
        }

        private long affordableWholeShares(BigDecimal price) {
            return availableCash
                    .divide(price, 0, RoundingMode.DOWN)
                    .longValueExact();
        }

        private void buy(long quantity, BigDecimal price) {
            BigDecimal purchaseCost = price.multiply(BigDecimal.valueOf(quantity));
            BigDecimal remainingCash = availableCash.subtract(purchaseCost);
            if (remainingCash.signum() < 0) {
                throw new IllegalStateException(
                        "Position sizing attempted to spend more than available cash"
                );
            }

            availableCash = remainingCash;
            holdingsQuantity = quantity;
            costBasis = purchaseCost;
        }

        private void sell(long quantity, BigDecimal price) {
            if (quantity != holdingsQuantity) {
                throw new IllegalStateException(
                        "Exit quantity does not match the held share quantity"
                );
            }

            BigDecimal proceeds = price.multiply(BigDecimal.valueOf(quantity));
            availableCash = availableCash.add(proceeds);
            realizedPnl = realizedPnl.add(proceeds.subtract(costBasis));
            holdingsQuantity = 0;
            costBasis = BigDecimal.ZERO;
        }

        private AccountSnapshot snapshot(int index, Bar bar) {
            double closePrice = bar.getClosePrice().doubleValue();
            if (!Double.isFinite(closePrice) || closePrice <= 0.0) {
                throw new IllegalArgumentException(
                        "Closing price must be finite and positive at index "
                                + index + ", found " + closePrice
                );
            }
            BigDecimal closingPrice = BigDecimal.valueOf(closePrice);
            BigDecimal holdingsMarketValue =
                    closingPrice.multiply(BigDecimal.valueOf(holdingsQuantity));
            BigDecimal unrealizedPnl =
                    holdingsMarketValue.subtract(costBasis);
            BigDecimal equity = availableCash.add(holdingsMarketValue);

            return new AccountSnapshot(
                    index,
                    bar.getEndTime(),
                    availableCash.doubleValue(),
                    holdingsQuantity,
                    costBasis.doubleValue(),
                    realizedPnl.doubleValue(),
                    unrealizedPnl.doubleValue(),
                    holdingsMarketValue.doubleValue(),
                    equity.doubleValue()
            );
        }

        private BigDecimal cash() {
            return availableCash;
        }
    }
}
