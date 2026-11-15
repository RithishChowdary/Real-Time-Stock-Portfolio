package com.major.stockportfolio.quantitative.report;

import java.time.Duration;
import java.time.ZonedDateTime;
import java.util.List;

import com.major.stockportfolio.quantitative.engine.AccountSnapshot;
import com.major.stockportfolio.quantitative.engine.BacktestResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.ta4j.core.BarSeries;
import org.ta4j.core.BaseBarSeriesBuilder;
import org.ta4j.core.BaseTradingRecord;
import org.ta4j.core.TradingRecord;
import org.ta4j.core.num.DecimalNum;
import org.ta4j.core.num.Num;

import static org.junit.jupiter.api.Assertions.*;

class PerformanceMetricsCalculatorTest {

    private PerformanceMetricsCalculator calculator;
    private ZonedDateTime baseTime;

    @BeforeEach
    void setUp() {
        calculator = new PerformanceMetricsCalculator();
        baseTime = ZonedDateTime.now();
    }

    private BarSeries createSeries(double... closePrices) {
        BarSeries series = new BaseBarSeriesBuilder().withName("TEST_SERIES").build();
        for (int i = 0; i < closePrices.length; i++) {
            double price = closePrices[i];
            series.barBuilder()
                    .timePeriod(Duration.ofDays(1))
                    .endTime(baseTime.plusDays(i).toInstant())
                    .openPrice(price)
                    .highPrice(price * 1.02)
                    .lowPrice(price * 0.98)
                    .closePrice(price)
                    .volume(1000)
                    .add();
        }
        return series;
    }

    private Num num(BarSeries series, Number n) {
        return DecimalNum.valueOf(n);
    }

    private AccountSnapshot snapshot(
            int barIndex,
            double cash,
            long quantity,
            double costBasis,
            double realizedPnl,
            double unrealizedPnl,
            double marketValue,
            double equity) {
        return new AccountSnapshot(
                barIndex,
                baseTime.plusDays(barIndex).toInstant(),
                cash,
                quantity,
                costBasis,
                realizedPnl,
                unrealizedPnl,
                marketValue,
                equity
        );
    }

    private BacktestResult result(
            TradingRecord tradingRecord,
            AccountSnapshot... snapshots) {
        return new BacktestResult(tradingRecord, List.of(snapshots));
    }

    private double expectedSharpe(double initialCapital, double... equityValues) {
        double[] returns = new double[equityValues.length];
        double previous = initialCapital;
        double mean = 0.0;
        for (int i = 0; i < equityValues.length; i++) {
            returns[i] = (equityValues[i] - previous) / previous;
            mean += returns[i];
            previous = equityValues[i];
        }
        mean /= returns.length;

        double squaredDifferences = 0.0;
        for (double dailyReturn : returns) {
            double difference = dailyReturn - mean;
            squaredDifferences += difference * difference;
        }
        double sampleDeviation = Math.sqrt(squaredDifferences / (returns.length - 1));
        return Math.round(
                ((mean - PerformanceMetricsCalculator.ANNUAL_RISK_FREE_RATE
                        / PerformanceMetricsCalculator.TRADING_DAYS_PER_YEAR)
                        / sampleDeviation
                        * Math.sqrt(PerformanceMetricsCalculator.TRADING_DAYS_PER_YEAR))
                        * 100.0
        ) / 100.0;
    }

    private double expectedSnapshotSharpe(double... equityValues) {
        double[] returns = new double[equityValues.length - 1];
        double mean = 0.0;
        for (int i = 1; i < equityValues.length; i++) {
            returns[i - 1] = (equityValues[i] - equityValues[i - 1]) / equityValues[i - 1];
            mean += returns[i - 1];
        }
        mean /= returns.length;

        double squaredDifferences = 0.0;
        for (double dailyReturn : returns) {
            double difference = dailyReturn - mean;
            squaredDifferences += difference * difference;
        }
        double sampleDeviation = Math.sqrt(squaredDifferences / (returns.length - 1));
        return Math.round(
                ((mean - PerformanceMetricsCalculator.ANNUAL_RISK_FREE_RATE
                        / PerformanceMetricsCalculator.TRADING_DAYS_PER_YEAR)
                        / sampleDeviation
                        * Math.sqrt(PerformanceMetricsCalculator.TRADING_DAYS_PER_YEAR))
                        * 100.0
        ) / 100.0;
    }

    // 1. Positive ROI
    @Test
    void testCalculate_PositiveRoi() {
        BarSeries series = createSeries(100, 105, 110, 115, 120, 125);
        TradingRecord record = new BaseTradingRecord();

        // Trade 1: Entry @ 100, Exit @ 120 -> +20,000 profit for 1000 shares
        record.enter(0, num(series, 100), num(series, 1000));
        record.exit(4, num(series, 120), num(series, 1000));

        PerformanceMetrics metrics = calculator.calculate(series, record, 100000.0);

        assertEquals(20000.0, metrics.getTotalEarnings());
        assertEquals(100000.0, metrics.getInitialCapital());
        assertEquals(120000.0, metrics.getFinalPortfolioValue());
        assertEquals(20.0, metrics.getReturnOnInvestment());
        assertEquals(20.0, metrics.getRoi());
        assertTrue(metrics.getReturnOnInvestment() > 0);
    }

    // 2. Negative ROI
    @Test
    void testCalculate_NegativeRoi() {
        BarSeries series = createSeries(100, 95, 90, 85, 80, 75);
        TradingRecord record = new BaseTradingRecord();

        // Trade 1: Entry @ 100, Exit @ 90 -> -10,000 loss for 1000 shares
        record.enter(0, num(series, 100), num(series, 1000));
        record.exit(2, num(series, 90), num(series, 1000));

        PerformanceMetrics metrics = calculator.calculate(series, record, 100000.0);

        assertEquals(-10000.0, metrics.getTotalEarnings());
        assertEquals(100000.0, metrics.getInitialCapital());
        assertEquals(90000.0, metrics.getFinalPortfolioValue());
        assertEquals(-10.0, metrics.getReturnOnInvestment());
        assertTrue(metrics.getReturnOnInvestment() < 0);
    }

    // 3. Zero ROI
    @Test
    void testCalculate_ZeroRoi() {
        BarSeries series = createSeries(100, 105, 100, 95, 100, 100);
        TradingRecord record = new BaseTradingRecord();

        // Trade 1: Entry @ 100, Exit @ 110 -> +10,000
        record.enter(0, num(series, 100), num(series, 1000));
        record.exit(1, num(series, 110), num(series, 1000));

        // Trade 2: Entry @ 100, Exit @ 90 -> -10,000
        record.enter(2, num(series, 100), num(series, 1000));
        record.exit(3, num(series, 90), num(series, 1000));

        PerformanceMetrics metrics = calculator.calculate(series, record, 100000.0);

        assertEquals(0.0, metrics.getTotalEarnings());
        assertEquals(100000.0, metrics.getInitialCapital());
        assertEquals(100000.0, metrics.getFinalPortfolioValue());
        assertEquals(0.0, metrics.getReturnOnInvestment());
    }

    // 4. Zero initial capital validation
    @Test
    void testCalculate_ZeroInitialCapitalValidation() {
        BarSeries series = createSeries(100, 110, 120);
        TradingRecord record = new BaseTradingRecord();
        record.enter(0, num(series, 100), num(series, 10));
        record.exit(1, num(series, 110), num(series, 10));

        PerformanceMetrics metricsZero = calculator.calculate(series, record, 0.0);
        assertEquals(0.0, metricsZero.getInitialCapital());
        assertEquals(0.0, metricsZero.getReturnOnInvestment());
        assertEquals(100.0, metricsZero.getFinalPortfolioValue());

        PerformanceMetrics metricsNegative = calculator.calculate(series, record, -50000.0);
        assertEquals(0.0, metricsNegative.getInitialCapital());
        assertEquals(0.0, metricsNegative.getReturnOnInvestment());
    }

    // 5. Final portfolio value
    @Test
    void testCalculate_FinalPortfolioValue() {
        BarSeries series = createSeries(100, 115, 120);
        TradingRecord record = new BaseTradingRecord();
        record.enter(0, num(series, 100), num(series, 100));
        record.exit(1, num(series, 115), num(series, 100)); // +1500

        PerformanceMetrics metrics = calculator.calculate(series, record, 100000.0);
        assertEquals(1500.0, metrics.getTotalEarnings());
        assertEquals(101500.0, metrics.getFinalPortfolioValue());
    }

    // 6. No completed trades
    @Test
    void testCalculate_NoCompletedTrades() {
        BarSeries series = createSeries(100, 102, 104, 103, 105);
        TradingRecord record = new BaseTradingRecord();

        PerformanceMetrics metrics = calculator.calculate(series, record, 100000.0);

        assertEquals(0, metrics.getTotalTrades());
        assertEquals(0, metrics.getWinningTrades());
        assertEquals(0, metrics.getLosingTrades());
        assertEquals(0.0, metrics.getWinRate());
        assertEquals(0.0, metrics.getTotalProfit());
        assertEquals(0.0, metrics.getTotalLoss());
        assertEquals(0.0, metrics.getTotalEarnings());
        assertEquals(0.0, metrics.getAverageProfit());
        assertEquals(0.0, metrics.getExpectancy());
        assertEquals(0.0, metrics.getAverageWinningTrade());
        assertEquals(0.0, metrics.getAverageLosingTrade());
        assertNull(metrics.getRiskRewardRatio());
        assertEquals(0.0, metrics.getProfitFactor());
        assertEquals(0.0, metrics.getMaximumDrawdown());
        assertNull(metrics.getSharpeRatio());
        assertEquals(100000.0, metrics.getFinalPortfolioValue());
        assertEquals(0.0, metrics.getReturnOnInvestment());
    }

    // 7. Zero gross loss
    @Test
    void testCalculate_ZeroGrossLoss() {
        BarSeries series = createSeries(100, 110, 115, 125, 130);
        TradingRecord record = new BaseTradingRecord();

        record.enter(0, num(series, 100), num(series, 10));
        record.exit(1, num(series, 110), num(series, 10)); // +100

        record.enter(2, num(series, 115), num(series, 10));
        record.exit(3, num(series, 125), num(series, 10)); // +100

        PerformanceMetrics metrics = calculator.calculate(series, record, 100000.0);

        assertEquals(2, metrics.getTotalTrades());
        assertEquals(2, metrics.getWinningTrades());
        assertEquals(0, metrics.getLosingTrades());
        assertEquals(200.0, metrics.getTotalProfit());
        assertEquals(0.0, metrics.getTotalLoss());
        assertEquals(200.0, metrics.getTotalEarnings());
        assertEquals(100.0, metrics.getWinRate());
        assertEquals(0.0, metrics.getAverageLosingTrade());
        // Zero loss means infinite profit factor -> returned as null to avoid Infinity in API JSON
        assertFalse(metrics.isProfitFactorDefined());
        assertEquals(0.0, metrics.getProfitFactor());
        // Risk reward ratio has 0 losing trades -> null
        assertNull(metrics.getRiskRewardRatio());
    }

    // 8. Profit Factor
    @Test
    void testCalculate_ProfitFactor() {
        BarSeries series = createSeries(100, 130, 120, 110, 115);
        TradingRecord record = new BaseTradingRecord();

        // Win: +300
        record.enter(0, num(series, 100), num(series, 10));
        record.exit(1, num(series, 130), num(series, 10));

        // Loss: -100
        record.enter(2, num(series, 120), num(series, 10));
        record.exit(3, num(series, 110), num(series, 10));

        PerformanceMetrics metrics = calculator.calculate(series, record, 100000.0);

        assertEquals(300.0, metrics.getTotalProfit());
        assertEquals(100.0, metrics.getTotalLoss());
        assertTrue(metrics.isProfitFactorDefined());
        assertEquals(3.0, metrics.getProfitFactor());
    }

    // 9. Maximum Drawdown preservation
    @Test
    void testCalculate_MaximumDrawdownPreservation() {
        BarSeries series = createSeries(100, 120, 90, 80, 110);
        TradingRecord record = new BaseTradingRecord();

        record.enter(0, num(series, 100), num(series, 1));
        record.exit(3, num(series, 80), num(series, 1));

        PerformanceMetrics metrics = calculator.calculate(series, record, 100000.0);
        assertTrue(metrics.getMaximumDrawdown() > 0.0);
    }

    // 10. Sharpe Ratio with valid returns
    @Test
    void testCalculate_SharpeRatio_ValidReturns() {
        // Series with 10 bars and alternating upward trend
        BarSeries series = createSeries(100, 102, 101, 105, 104, 108, 107, 112, 110, 115);
        TradingRecord record = new BaseTradingRecord();

        record.enter(0, num(series, 100), num(series, 10));
        record.exit(5, num(series, 108), num(series, 10));

        record.enter(6, num(series, 107), num(series, 10));
        record.exit(9, num(series, 115), num(series, 10));

        PerformanceMetrics metrics = calculator.calculate(series, record, 100000.0);

        assertNotNull(metrics.getSharpeRatio());
        assertFalse(Double.isNaN(metrics.getSharpeRatio()));
        assertFalse(Double.isInfinite(metrics.getSharpeRatio()));
    }

    // 11. Sharpe Ratio with insufficient observations
    @Test
    void testCalculate_SharpeRatio_InsufficientObservations() {
        BarSeries series = createSeries(100, 105, 110);
        TradingRecord record = new BaseTradingRecord();
        record.enter(0, num(series, 100), num(series, 1));
        record.exit(1, num(series, 105), num(series, 1));

        PerformanceMetrics metrics = calculator.calculate(series, record, 100000.0);
        assertNull(metrics.getSharpeRatio());
    }

    // 12. Sharpe Ratio with zero volatility
    @Test
    void testCalculate_SharpeRatio_ZeroVolatility() {
        // Flat bars -> zero price movement -> standard deviation = 0
        BarSeries series = createSeries(100, 100, 100, 100, 100, 100, 100);
        TradingRecord record = new BaseTradingRecord();
        record.enter(0, num(series, 100), num(series, 1));
        record.exit(5, num(series, 100), num(series, 1));

        PerformanceMetrics metrics = calculator.calculate(series, record, 100000.0);
        assertNull(metrics.getSharpeRatio());
    }

    // 13. Expectancy per trade
    @Test
    void testCalculate_ExpectancyPerTrade() {
        BarSeries series = createSeries(100, 120, 110, 105, 115);
        TradingRecord record = new BaseTradingRecord();

        // Win: +200
        record.enter(0, num(series, 100), num(series, 10));
        record.exit(1, num(series, 120), num(series, 10));

        // Loss: -50
        record.enter(2, num(series, 110), num(series, 10));
        record.exit(3, num(series, 105), num(series, 10));

        PerformanceMetrics metrics = calculator.calculate(series, record, 100000.0);

        // Expectancy = (200 - 50) / 2 = 75.0
        assertEquals(75.0, metrics.getExpectancy());
        assertEquals(75.0, metrics.getAverageProfit());
    }

    // 14. Average winning trade
    @Test
    void testCalculate_AverageWinningTrade() {
        BarSeries series = createSeries(100, 110, 100, 120, 100);
        TradingRecord record = new BaseTradingRecord();

        // Win 1: +100
        record.enter(0, num(series, 100), num(series, 10));
        record.exit(1, num(series, 110), num(series, 10));

        // Win 2: +200
        record.enter(2, num(series, 100), num(series, 10));
        record.exit(3, num(series, 120), num(series, 10));

        PerformanceMetrics metrics = calculator.calculate(series, record, 100000.0);

        // Total profit = 300, 2 winning trades -> Average = 150.0
        assertEquals(150.0, metrics.getAverageWinningTrade());
    }

    // 15. Average losing trade
    @Test
    void testCalculate_AverageLosingTrade() {
        BarSeries series = createSeries(100, 90, 100, 80, 100);
        TradingRecord record = new BaseTradingRecord();

        // Loss 1: -100
        record.enter(0, num(series, 100), num(series, 10));
        record.exit(1, num(series, 90), num(series, 10));

        // Loss 2: -200
        record.enter(2, num(series, 100), num(series, 10));
        record.exit(3, num(series, 80), num(series, 10));

        PerformanceMetrics metrics = calculator.calculate(series, record, 100000.0);

        // Total loss = 300, 2 losing trades -> Average = 150.0
        assertEquals(150.0, metrics.getAverageLosingTrade());
    }

    // 16. Risk/Reward Ratio
    @Test
    void testCalculate_RiskRewardRatio() {
        BarSeries series = createSeries(100, 130, 100, 90, 100);
        TradingRecord record = new BaseTradingRecord();

        // Win: +300 (Average Win = 300)
        record.enter(0, num(series, 100), num(series, 10));
        record.exit(1, num(series, 130), num(series, 10));

        // Loss: -100 (Average Loss = 100)
        record.enter(2, num(series, 100), num(series, 10));
        record.exit(3, num(series, 90), num(series, 10));

        PerformanceMetrics metrics = calculator.calculate(series, record, 100000.0);

        // Risk / Reward Ratio = 300 / 100 = 3.0
        assertNotNull(metrics.getRiskRewardRatio());
        assertEquals(3.0, metrics.getRiskRewardRatio());
    }

    // 17. Open-position treatment
    @Test
    void testCalculate_OpenPositionTreatment() {
        BarSeries series = createSeries(100, 110, 105, 125);
        TradingRecord record = new BaseTradingRecord();

        // Closed trade: Entry @ 100, Exit @ 110 -> Realized = +100
        record.enter(0, num(series, 100), num(series, 10));
        record.exit(1, num(series, 110), num(series, 10));

        // Open trade: Entry @ 105 on bar 2, no exit. Final bar close is 125.
        // Unrealized P&L = (125 - 105) * 10 = +200
        record.enter(2, num(series, 105), num(series, 10));

        PerformanceMetrics metrics = calculator.calculate(series, record, 100000.0);

        // 1 completed trade
        assertEquals(1, metrics.getTotalTrades());
        assertEquals(100.0, metrics.getTotalProfit());
        // Total earnings includes completed (+100) + unrealized (+200) = +300
        assertEquals(300.0, metrics.getTotalEarnings());
        assertEquals(100300.0, metrics.getFinalPortfolioValue());
        assertEquals(0.3, metrics.getReturnOnInvestment());
    }

    // 18. Position sizing against available capital
    @Test
    void testCalculate_PositionSizingAgainstCapital() {
        BarSeries series = createSeries(2500, 2600, 2700);
        TradingRecord record = new BaseTradingRecord();

        // Buying 10 shares of a ₹2500 stock uses ₹25,000 of ₹1,00,000 initial capital
        record.enter(0, num(series, 2500), num(series, 10));
        record.exit(1, num(series, 2600), num(series, 10)); // Profit = +1000

        PerformanceMetrics metrics = calculator.calculate(series, record, 100000.0);
        assertEquals(1000.0, metrics.getTotalEarnings());
        assertEquals(1.0, metrics.getReturnOnInvestment());
        assertEquals(101000.0, metrics.getFinalPortfolioValue());
    }

    // 19. Consistency between net earnings, ROI and final capital
    @Test
    void testCalculate_Consistency_NetEarningsRoiAndFinalCapital() {
        BarSeries series = createSeries(100, 125, 100, 85);
        TradingRecord record = new BaseTradingRecord();

        // Win: +2500
        record.enter(0, num(series, 100), num(series, 100));
        record.exit(1, num(series, 125), num(series, 100));

        // Loss: -1500
        record.enter(2, num(series, 100), num(series, 100));
        record.exit(3, num(series, 85), num(series, 100));

        double initialCap = 100000.0;
        PerformanceMetrics metrics = calculator.calculate(series, record, initialCap);

        double expectedNetEarnings = 1000.0;
        double expectedFinalValue = 101000.0;
        double expectedRoi = 1.0;

        assertEquals(expectedNetEarnings, metrics.getTotalEarnings());
        assertEquals(expectedFinalValue, metrics.getFinalPortfolioValue());
        assertEquals(expectedRoi, metrics.getReturnOnInvestment());
        assertEquals(metrics.getFinalPortfolioValue(), metrics.getInitialCapital() + metrics.getTotalEarnings());
        assertEquals(metrics.getReturnOnInvestment(), (metrics.getTotalEarnings() / metrics.getInitialCapital()) * 100.0);
    }

    // 20. Existing EMA + RSI backtesting functionality
    @Test
    void testCalculate_EmaRsiStrategyBehaviorPreserved() {
        BarSeries series = createSeries(100, 110, 105, 120, 115, 130);
        TradingRecord record = new BaseTradingRecord();

        record.enter(0, num(series, 100), num(series, 1));
        record.exit(1, num(series, 110), num(series, 1));
        record.enter(2, num(series, 105), num(series, 1));
        record.exit(3, num(series, 120), num(series, 1));

        PerformanceMetrics metrics = calculator.calculate(series, record, 100000.0);

        assertEquals(2, metrics.getTotalTrades());
        assertEquals(2, metrics.getWinningTrades());
        assertEquals(0, metrics.getLosingTrades());
        assertEquals(25.0, metrics.getTotalEarnings());
        assertEquals(100.0, metrics.getWinRate());
    }

    // 21. Existing EMA Crossover backtesting functionality
    @Test
    void testCalculate_EmaCrossoverStrategyBehaviorPreserved() {
        BarSeries series = createSeries(50, 45, 40, 55, 60, 50);
        TradingRecord record = new BaseTradingRecord();

        record.enter(0, num(series, 50), num(series, 1));
        record.exit(2, num(series, 40), num(series, 1)); // -10

        record.enter(3, num(series, 55), num(series, 1));
        record.exit(4, num(series, 60), num(series, 1)); // +5

        PerformanceMetrics metrics = calculator.calculate(series, record, 100000.0);

        assertEquals(2, metrics.getTotalTrades());
        assertEquals(1, metrics.getWinningTrades());
        assertEquals(1, metrics.getLosingTrades());
        assertEquals(-5.0, metrics.getTotalEarnings());
        assertEquals(50.0, metrics.getWinRate());
        assertEquals(0.5, metrics.getProfitFactor());
    }

    @Test
    void calculateFromBacktestResult_UsesFinalEquityForPositiveRoi() {
        TradingRecord record = new BaseTradingRecord();
        PerformanceMetrics metrics = calculator.calculate(
                result(
                        record,
                        snapshot(0, 1000.0, 0, 0.0, 0.0, 0.0, 0.0, 1000.0),
                        snapshot(1, 1000.0, 0, 0.0, 0.0, 0.0, 0.0, 1000.0),
                        snapshot(2, 1000.0, 0, 0.0, 0.0, 0.0, 0.0, 1000.0),
                        snapshot(3, 1000.0, 0, 0.0, 0.0, 0.0, 0.0, 1000.0),
                        snapshot(4, 1000.0, 0, 0.0, 0.0, 0.0, 0.0, 1200.0)
                ),
                1000.0
        );

        assertEquals(1200.0, metrics.getFinalPortfolioValue());
        assertEquals(200.0, metrics.getTotalEarnings());
        assertEquals(20.0, metrics.getReturnOnInvestment());
    }

    @Test
    void calculateFromBacktestResult_UsesFinalEquityForNegativeRoi() {
        PerformanceMetrics metrics = calculator.calculate(
                result(
                        new BaseTradingRecord(),
                        snapshot(0, 1000.0, 0, 0.0, 0.0, 0.0, 0.0, 1000.0),
                        snapshot(1, 1000.0, 0, 0.0, 0.0, 0.0, 0.0, 950.0),
                        snapshot(2, 1000.0, 0, 0.0, 0.0, 0.0, 0.0, 900.0)
                ),
                1000.0
        );

        assertEquals(900.0, metrics.getFinalPortfolioValue());
        assertEquals(-100.0, metrics.getTotalEarnings());
        assertEquals(-10.0, metrics.getReturnOnInvestment());
    }

    @Test
    void calculateFromBacktestResult_OpenPositionAffectsAccountOnly() {
        BarSeries series = createSeries(100, 100, 120);
        TradingRecord record = new BaseTradingRecord();
        record.enter(1, num(series, 100), num(series, 2));

        PerformanceMetrics metrics = calculator.calculate(
                result(
                        record,
                        snapshot(0, 1000.0, 0, 0.0, 0.0, 0.0, 0.0, 1000.0),
                        snapshot(1, 800.0, 2, 200.0, 0.0, 0.0, 200.0, 1000.0),
                        snapshot(2, 800.0, 2, 200.0, 0.0, 40.0, 240.0, 1040.0)
                ),
                1000.0
        );

        assertEquals(1040.0, metrics.getFinalPortfolioValue());
        assertEquals(40.0, metrics.getTotalEarnings());
        assertEquals(4.0, metrics.getReturnOnInvestment());
        assertEquals(0, metrics.getTotalTrades());
        assertEquals(0, metrics.getWinningTrades());
        assertEquals(0, metrics.getLosingTrades());
        assertEquals(0.0, metrics.getTotalProfit());
        assertEquals(0.0, metrics.getTotalLoss());
    }

    @Test
    void calculateFromBacktestResult_SeparatesTradeStatsFromAccountReturns() {
        BarSeries series = createSeries(10, 20, 20, 10);
        TradingRecord record = new BaseTradingRecord();
        record.enter(0, num(series, 10), num(series, 10));
        record.exit(1, num(series, 20), num(series, 10));
        record.enter(2, num(series, 20), num(series, 5));
        record.exit(3, num(series, 10), num(series, 5));

        PerformanceMetrics metrics = calculator.calculate(
                result(
                        record,
                        snapshot(0, 1000.0, 0, 0.0, 0.0, 0.0, 0.0, 1000.0),
                        snapshot(1, 1000.0, 0, 0.0, 100.0, 0.0, 0.0, 1100.0),
                        snapshot(2, 1000.0, 0, 0.0, 100.0, 0.0, 0.0, 1050.0),
                        snapshot(3, 1800.0, 0, 0.0, 50.0, 0.0, 0.0, 1800.0)
                ),
                1000.0
        );

        assertEquals(2, metrics.getTotalTrades());
        assertEquals(1, metrics.getWinningTrades());
        assertEquals(1, metrics.getLosingTrades());
        assertEquals(100.0, metrics.getTotalProfit());
        assertEquals(50.0, metrics.getTotalLoss());
        assertEquals(25.0, metrics.getExpectancy());
        assertEquals(2.0, metrics.getProfitFactor());
        assertEquals(800.0, metrics.getTotalEarnings());
        assertEquals(1800.0, metrics.getFinalPortfolioValue());
        assertEquals(80.0, metrics.getReturnOnInvestment());
    }

    @Test
    void calculateFromBacktestResult_CapturesDrawdownDuringOpenPosition() {
        BarSeries series = createSeries(100, 110, 88, 95);
        TradingRecord record = new BaseTradingRecord();
        record.enter(0, num(series, 100), num(series, 10));

        PerformanceMetrics metrics = calculator.calculate(
                result(
                        record,
                        snapshot(0, 1000.0, 0, 0.0, 0.0, 0.0, 0.0, 1000.0),
                        snapshot(1, 100.0, 10, 1000.0, 0.0, 100.0, 1100.0, 1200.0),
                        snapshot(2, 100.0, 10, 1000.0, 0.0, -140.0, 860.0, 960.0),
                        snapshot(3, 100.0, 10, 1000.0, 0.0, -50.0, 950.0, 1050.0)
                ),
                1000.0
        );

        assertEquals(20.0, metrics.getMaximumDrawdown());
        assertEquals(0, metrics.getTotalTrades());
    }

    @Test
    void calculateFromBacktestResult_SharpeExcludesInitialCapitalToFirstSnapshotReturn() {
        double[] equityValues = {900.0, 1100.0, 990.0, 1089.0, 1089.0};
        PerformanceMetrics metrics = calculator.calculate(
                result(
                        new BaseTradingRecord(),
                        snapshot(0, 900.0, 0, 0.0, 0.0, 0.0, 0.0, equityValues[0]),
                        snapshot(1, 1100.0, 0, 0.0, 0.0, 0.0, 0.0, equityValues[1]),
                        snapshot(2, 990.0, 0, 0.0, 0.0, 0.0, 0.0, equityValues[2]),
                        snapshot(3, 1089.0, 0, 0.0, 0.0, 0.0, 0.0, equityValues[3]),
                        snapshot(4, 1089.0, 0, 0.0, 0.0, 0.0, 0.0, equityValues[4])
                ),
                1000.0
        );

        assertEquals(expectedSnapshotSharpe(equityValues), metrics.getSharpeRatio());
        assertNotEquals(expectedSharpe(1000.0, equityValues), metrics.getSharpeRatio());
    }

    @Test
    void calculateFromBacktestResult_ReturnsNullSharpeForZeroVolatility() {
        PerformanceMetrics metrics = calculator.calculate(
                result(
                        new BaseTradingRecord(),
                        snapshot(0, 1000.0, 0, 0.0, 0.0, 0.0, 0.0, 1000.0),
                        snapshot(1, 1000.0, 0, 0.0, 0.0, 0.0, 0.0, 1000.0),
                        snapshot(2, 1000.0, 0, 0.0, 0.0, 0.0, 0.0, 1000.0),
                        snapshot(3, 1000.0, 0, 0.0, 0.0, 0.0, 0.0, 1000.0)
                ),
                1000.0
        );

        assertNull(metrics.getSharpeRatio());
    }

    @Test
    void calculateFromBacktestResult_ReturnsNullSharpeForInsufficientObservations() {
        PerformanceMetrics metrics = calculator.calculate(
                result(
                        new BaseTradingRecord(),
                        snapshot(0, 1000.0, 0, 0.0, 0.0, 0.0, 0.0, 1010.0),
                        snapshot(1, 1000.0, 0, 0.0, 0.0, 0.0, 0.0, 1020.0),
                        snapshot(2, 1000.0, 0, 0.0, 0.0, 0.0, 0.0, 1030.0)
                ),
                1000.0
        );

        assertNull(metrics.getSharpeRatio());
    }

    @Test
    void backwardCompatiblePerformanceMetricsConstructorStillDerivesCapitalFields() {
        PerformanceMetrics metrics = new PerformanceMetrics(
                2, 1, 1, 50.0, 200.0, 50.0, 150.0, 75.0, 10.0, 4.0
        );

        assertEquals(100000.0, metrics.getInitialCapital());
        assertEquals(100150.0, metrics.getFinalPortfolioValue());
        assertEquals(0.15, metrics.getReturnOnInvestment());
        assertEquals(75.0, metrics.getExpectancy());
        double primitiveProfitFactor = metrics.getProfitFactor();
        assertEquals(4.0, primitiveProfitFactor);
        assertTrue(metrics.isProfitFactorDefined());
    }

    @Test
    void undefinedProfitFactorUsesPrimitiveGetterAndExplicitAvailabilityFlag() {
        PerformanceMetrics metrics = new PerformanceMetrics(
                1, 1, 0, 100.0, 25.0, 0.0, 25.0, 25.0, 0.0, (Double) null
        );

        assertEquals(0.0, metrics.getProfitFactor());
        assertFalse(metrics.isProfitFactorDefined());
    }
}
