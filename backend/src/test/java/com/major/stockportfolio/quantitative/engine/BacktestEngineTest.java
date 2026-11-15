package com.major.stockportfolio.quantitative.engine;

import java.time.Duration;
import java.time.Instant;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.ta4j.core.BarSeries;
import org.ta4j.core.BaseBarSeriesBuilder;
import org.ta4j.core.BaseStrategy;
import org.ta4j.core.Position;
import org.ta4j.core.Rule;
import org.ta4j.core.Strategy;
import org.ta4j.core.TradingRecord;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class BacktestEngineTest {

    private BacktestEngine engine;
    private Instant startTime;

    @BeforeEach
    void setUp() {
        engine = new BacktestEngine();
        startTime = Instant.parse("2025-01-01T00:00:00Z");
    }

    @Test
    void sizesEntryToAffordableWholeSharesAndRecordsTheActualAmount() {
        BarSeries series = createSeries(
                new double[]{100, 103, 105},
                new double[]{100, 110, 108}
        );

        BacktestResult result = engine.runWithAccount(
                series,
                strategyAt(0, -1),
                1000.0
        );

        Position position = result.getTradingRecord().getCurrentPosition();
        assertTrue(position.isOpened());
        assertEquals(103.0, position.getEntry().getPricePerAsset().doubleValue());
        assertEquals(9L, position.getEntry().getAmount().longValue());

        AccountSnapshot afterEntry = result.getAccountSnapshots().get(1);
        assertEquals(73.0, afterEntry.getAvailableCash());
        assertEquals(9L, afterEntry.getHoldingsQuantity());
        assertEquals(927.0, afterEntry.getCostBasis());
        assertEquals(63.0, afterEntry.getUnrealizedPnl());
        assertEquals(1063.0, afterEntry.getEquity());
    }

    @Test
    void skipsEntryWhenCashCannotBuyOneWholeShare() {
        BarSeries series = createSeries(
                new double[]{50, 100, 101},
                new double[]{50, 102, 101}
        );

        BacktestResult result = engine.runWithAccount(
                series,
                strategyAt(0, -1),
                99.0
        );

        assertFalse(result.getTradingRecord().getCurrentPosition().isOpened());
        assertEquals(0, result.getTradingRecord().getPositionCount());
        for (AccountSnapshot snapshot : result.getAccountSnapshots()) {
            assertEquals(99.0, snapshot.getAvailableCash());
            assertEquals(0L, snapshot.getHoldingsQuantity());
            assertTrue(snapshot.getAvailableCash() >= 0.0);
            assertEquals(99.0, snapshot.getEquity());
        }
    }

    @Test
    void fillsSignalsAtNextBarOpenNotSignalBarClose() {
        BarSeries series = createSeries(
                new double[]{100, 103, 105},
                new double[]{101, 109, 105}
        );

        TradingRecord record = engine.run(series, strategyAt(0, -1), 1000.0);

        assertNotNull(record.getCurrentPosition().getEntry());
        assertEquals(1, record.getCurrentPosition().getEntry().getIndex());
        assertEquals(103.0, record.getCurrentPosition()
                .getEntry().getPricePerAsset().doubleValue());
    }

    @Test
    void ignoresWarmupSignalsUntilTheConfiguredSignalIndex() {
        BarSeries series = createSeries(
                new double[]{100, 100, 100, 100},
                new double[]{100, 100, 100, 100}
        );
        Rule entryRule = (index, record) -> index == 1 || index == 2;
        Strategy strategy = new BaseStrategy(entryRule, (index, record) -> false);

        BacktestResult result = engine.runWithAccount(
                series,
                strategy,
                1000.0,
                2
        );

        assertTrue(result.getTradingRecord().getCurrentPosition().isOpened());
        assertEquals(
                3,
                result.getTradingRecord().getCurrentPosition().getEntry().getIndex()
        );
    }

    @Test
    void exitsEntireHeldQuantityAtNextBarOpenAndReconcilesCashAndPnl() {
        BarSeries series = createSeries(
                new double[]{100, 103, 105, 120},
                new double[]{100, 110, 107, 118}
        );

        BacktestResult result = engine.runWithAccount(
                series,
                strategyAt(0, 2),
                1000.0
        );

        TradingRecord record = result.getTradingRecord();
        Position closedPosition = record.getLastPosition();
        assertFalse(closedPosition.isOpened());
        assertEquals(9L, closedPosition.getEntry().getAmount().longValue());
        assertEquals(9L, closedPosition.getExit().getAmount().longValue());
        assertEquals(3, closedPosition.getExit().getIndex());
        assertEquals(120.0, closedPosition.getExit().getPricePerAsset().doubleValue());

        AccountSnapshot afterExit = result.getAccountSnapshots().get(3);
        assertEquals(1153.0, afterExit.getAvailableCash());
        assertEquals(0L, afterExit.getHoldingsQuantity());
        assertEquals(0.0, afterExit.getCostBasis());
        assertEquals(153.0, afterExit.getRealizedPnl());
        assertEquals(0.0, afterExit.getUnrealizedPnl());
        assertEquals(1153.0, afterExit.getEquity());
    }

    @Test
    void capturesReconcilingAccountStateAtEveryBarClose() {
        BarSeries series = createSeries(
                new double[]{100, 103, 105, 120},
                new double[]{100, 110, 107, 118}
        );

        BacktestResult result = engine.runWithAccount(
                series,
                strategyAt(0, 2),
                1000.0
        );

        assertEquals(series.getBarCount(), result.getAccountSnapshots().size());
        for (int i = 0; i < result.getAccountSnapshots().size(); i++) {
            AccountSnapshot snapshot = result.getAccountSnapshots().get(i);
            double reconciledEquity = snapshot.getAvailableCash()
                    + snapshot.getHoldingsMarketValue();

            assertEquals(series.getBeginIndex() + i, snapshot.getBarIndex());
            assertEquals(reconciledEquity, snapshot.getEquity(), 1e-8);
            assertTrue(snapshot.getAvailableCash() >= 0.0);
            assertEquals(
                    (series.getBar(snapshot.getBarIndex()).getClosePrice().doubleValue()
                            * snapshot.getHoldingsQuantity())
                            - snapshot.getCostBasis(),
                    snapshot.getUnrealizedPnl(),
                    1e-8
            );
        }
    }

    @Test
    void leavesEndOfSeriesPositionOpenAndMarksItToFinalClose() {
        BarSeries series = createSeries(
                new double[]{100, 103, 105},
                new double[]{100, 110, 125}
        );

        BacktestResult result = engine.runWithAccount(
                series,
                strategyAt(0, 2),
                1000.0
        );

        Position position = result.getTradingRecord().getCurrentPosition();
        assertTrue(position.isOpened());
        assertEquals(1, position.getEntry().getIndex());
        assertEquals(9L, position.getEntry().getAmount().longValue());

        AccountSnapshot finalSnapshot = result.getAccountSnapshots()
                .get(result.getAccountSnapshots().size() - 1);
        assertEquals(73.0, finalSnapshot.getAvailableCash());
        assertEquals(9L, finalSnapshot.getHoldingsQuantity());
        assertEquals(927.0, finalSnapshot.getCostBasis());
        assertEquals(198.0, finalSnapshot.getUnrealizedPnl());
        assertEquals(1198.0, finalSnapshot.getEquity());
        assertEquals(1198.0, result.getFinalEquity());
    }

    @Test
    void defaultsExistingRunCallersToOneHundredThousandCapital() {
        BarSeries series = createSeries(
                new double[]{100, 100},
                new double[]{100, 100}
        );

        TradingRecord record = engine.run(series, strategyAt(0, -1));

        assertEquals(
                1000L,
                record.getCurrentPosition().getEntry().getAmount().longValue()
        );
    }

    private Strategy strategyAt(int entrySignalIndex, int exitSignalIndex) {
        Rule entryRule = (index, record) -> index == entrySignalIndex;
        Rule exitRule = (index, record) -> index == exitSignalIndex;
        return new BaseStrategy(entryRule, exitRule);
    }

    private BarSeries createSeries(double[] openPrices, double[] closePrices) {
        BarSeries series = new BaseBarSeriesBuilder()
                .withName("BACKTEST_ENGINE_TEST")
                .build();

        for (int i = 0; i < openPrices.length; i++) {
            double open = openPrices[i];
            double close = closePrices[i];
            series.barBuilder()
                    .timePeriod(Duration.ofDays(1))
                    .endTime(startTime.plus(Duration.ofDays(i + 1)))
                    .openPrice(open)
                    .highPrice(Math.max(open, close))
                    .lowPrice(Math.min(open, close))
                    .closePrice(close)
                    .volume(1000)
                    .add();
        }
        return series;
    }
}
