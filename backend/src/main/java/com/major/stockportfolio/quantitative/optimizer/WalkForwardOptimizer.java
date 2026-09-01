package com.major.stockportfolio.quantitative.optimizer;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.ta4j.core.BarSeries;
import org.ta4j.core.Position;
import org.ta4j.core.Strategy;
import org.ta4j.core.TradingRecord;
import org.ta4j.core.backtest.BarSeriesManager;

import com.major.stockportfolio.quantitative.config.StrategyConfig;
import com.major.stockportfolio.quantitative.engine.BacktestEngine;
import com.major.stockportfolio.quantitative.report.TradingProfitCalculator;

/**
 * Performs walk-forward optimization to evaluate a trading strategy
 * on unseen historical data.
 *
 * <p>
 * For every walk-forward window:
 * </p>
 *
 * <ol>
 *     <li>Use the training window to find the best parameters.</li>
 *     <li>Create a strategy using those parameters.</li>
 *     <li>Use historical bars as indicator warm-up data.</li>
 *     <li>Evaluate the strategy only on the unseen testing window.</li>
 *     <li>Move the window forward and repeat.</li>
 * </ol>
 */
public class WalkForwardOptimizer {

    private static final Logger log =
            LoggerFactory.getLogger(
                    WalkForwardOptimizer.class
            );

    private final ParameterOptimizer parameterOptimizer;

    private final BacktestEngine backtestEngine;

    private final TradingProfitCalculator tradingProfitCalculator;

    private final int trainingWindowSize;

    private final int testingWindowSize;

    private final int stepSize;

    /**
     * Creates a walk-forward optimizer.
     *
     * @param parameterOptimizer optimizer used to find the best strategy
     *                           configuration
     * @param backtestEngine backtest engine used by the quantitative
     *                       architecture
     * @param tradingProfitCalculator calculates realized and unrealized
     *                                testing profit
     * @param trainingWindowSize number of bars used for training
     * @param testingWindowSize number of bars used for out-of-sample testing
     * @param stepSize number of bars by which the window moves forward
     */
    public WalkForwardOptimizer(
            ParameterOptimizer parameterOptimizer,
            BacktestEngine backtestEngine,
            TradingProfitCalculator tradingProfitCalculator,
            int trainingWindowSize,
            int testingWindowSize,
            int stepSize) {

        this.parameterOptimizer =
                Objects.requireNonNull(
                        parameterOptimizer,
                        "ParameterOptimizer must not be null"
                );

        this.backtestEngine =
                Objects.requireNonNull(
                        backtestEngine,
                        "BacktestEngine must not be null"
                );

        this.tradingProfitCalculator =
                Objects.requireNonNull(
                        tradingProfitCalculator,
                        "TradingProfitCalculator must not be null"
                );

        if (trainingWindowSize <= 0) {
            throw new IllegalArgumentException(
                    "Training window size must be greater than zero"
            );
        }

        if (testingWindowSize <= 0) {
            throw new IllegalArgumentException(
                    "Testing window size must be greater than zero"
            );
        }

        if (stepSize <= 0) {
            throw new IllegalArgumentException(
                    "Step size must be greater than zero"
            );
        }

        this.trainingWindowSize = trainingWindowSize;
        this.testingWindowSize = testingWindowSize;
        this.stepSize = stepSize;
    }

    /**
     * Executes walk-forward optimization.
     *
     * <p>
     * Parameters are optimized only on the training portion.
     * The selected strategy is then evaluated on unseen testing data.
     * </p>
     *
     * @param series complete historical market data
     * @return immutable list containing walk-forward results
     */
    public List<WalkForwardResult> optimize(
            BarSeries series) {

        Objects.requireNonNull(
                series,
                "BarSeries must not be null"
        );

        if (series.isEmpty()) {
            throw new IllegalArgumentException(
                    "BarSeries must contain at least one bar"
            );
        }

        int requiredBars =
                trainingWindowSize + testingWindowSize;

        if (series.getBarCount() < requiredBars) {
            throw new IllegalArgumentException(
                    "Not enough bars for walk-forward optimization. "
                            + "Required at least "
                            + requiredBars
                            + ", found "
                            + series.getBarCount()
            );
        }

        log.info(
                "Starting walk-forward optimization. "
                        + "Series: {}, bars: {}, training: {}, "
                        + "testing: {}, step: {}",
                series.getName(),
                series.getBarCount(),
                trainingWindowSize,
                testingWindowSize,
                stepSize
        );

        List<WalkForwardResult> results =
                new ArrayList<>();

        int windowNumber = 1;

        for (
                int trainingStart = 0;
                trainingStart
                        + trainingWindowSize
                        + testingWindowSize
                        <= series.getBarCount();
                trainingStart += stepSize
        ) {

            int trainingEnd =
                    trainingStart + trainingWindowSize;

            int testingStart =
                    trainingEnd;

            int testingEnd =
                    testingStart + testingWindowSize;

            log.info(
                    "Walk-forward window {}: "
                            + "training [{}-{}), "
                            + "testing [{}-{})",
                    windowNumber,
                    trainingStart,
                    trainingEnd,
                    testingStart,
                    testingEnd
            );

            /*
             * ==========================================================
             * 1. TRAINING DATA
             * ==========================================================
             *
             * Parameters are optimized ONLY using the training data.
             *
             * Testing data is not visible to the optimizer.
             */
            BarSeries trainingSeries =
                    series.getSubSeries(
                            trainingStart,
                            trainingEnd
                    );

            StrategyConfig bestConfig =
                    parameterOptimizer.optimize(
                            trainingSeries
                    );

            log.info(
                    "Window {} best configuration: "
                            + "EMA {}/{} | RSI {} | "
                            + "Buy {} | Sell {}",
                    windowNumber,
                    bestConfig.getFastEmaPeriod(),
                    bestConfig.getSlowEmaPeriod(),
                    bestConfig.getRsiPeriod(),
                    bestConfig.getRsiBuyThreshold(),
                    bestConfig.getRsiSellThreshold()
            );

            /*
             * ==========================================================
             * 2. EVALUATION SERIES
             * ==========================================================
             *
             * The training bars are retained as indicator warm-up data.
             *
             * Structure:
             *
             * [ TRAINING DATA ][ TESTING DATA ]
             *        50 bars        25 bars
             *
             * Indicators such as EMA and RSI therefore have historical
             * context when testing begins.
             */
            BarSeries evaluationSeries =
                    series.getSubSeries(
                            trainingStart,
                            testingEnd
                    );

            /*
             * ==========================================================
             * 3. CREATE TESTING STRATEGY
             * ==========================================================
             */
            Strategy testingStrategy =
                    parameterOptimizer.createStrategy(
                            evaluationSeries,
                            bestConfig
                    );

            /*
             * ==========================================================
             * 4. RUN ONLY THE TESTING PERIOD
             * ==========================================================
             *
             * The first trainingWindowSize bars are used only as
             * indicator warm-up.
             *
             * Actual strategy evaluation begins at:
             *
             *     trainingWindowSize
             *
             * and continues through the final testing bar.
             */
            BarSeriesManager manager =
                    new BarSeriesManager(
                            evaluationSeries
                    );

            TradingRecord testingRecord =
                    manager.run(
                            testingStrategy,
                            trainingWindowSize,
                            evaluationSeries.getEndIndex()
                    );

            /*
             * ==========================================================
             * 5. DETERMINE POSITION STATUS
             * ==========================================================
             */
            int positionCount =
                    testingRecord.getPositionCount();

            int completedTrades = 0;

            for (Position position :
                    testingRecord.getPositions()) {

                if (position != null
                        && position.getEntry() != null
                        && position.getExit() != null) {

                    completedTrades++;
                }
            }

            boolean openPosition =
                    testingRecord.getCurrentPosition() != null
                            && testingRecord
                                    .getCurrentPosition()
                                    .isOpened();

            log.info(
                    "Window {} testing result: "
                            + "positions={}, completedTrades={}, "
                            + "openPosition={}",
                    windowNumber,
                    positionCount,
                    completedTrades,
                    openPosition
            );

            /*
             * ==========================================================
             * 6. CALCULATE TESTING PROFIT
             * ==========================================================
             *
             * TradingProfitCalculator uses:
             *
             *   Completed position
             *       -> realized profit/loss
             *
             *   Open position
             *       -> unrealized profit/loss using final close price
             *
             * This makes optimization consistent with the same
             * profit definition used elsewhere in the quantitative
             * engine.
             */
            double testingProfit =
                    tradingProfitCalculator.calculate(
                            evaluationSeries,
                            testingRecord
                    );

            /*
             * ==========================================================
             * 7. BUILD WALK-FORWARD RESULT
             * ==========================================================
             */
            WalkForwardResult result =
                    new WalkForwardResult(
                            windowNumber,
                            trainingStart,
                            trainingEnd,
                            testingStart,
                            testingEnd,
                            bestConfig,
                            testingProfit,
                            completedTrades
                    );

            results.add(result);

            log.info(
                    "Window {} completed. "
                            + "Out-of-sample profit: {}, "
                            + "completed trades: {}, "
                            + "open position: {}",
                    windowNumber,
                    String.format(
                            "%.2f",
                            testingProfit
                    ),
                    completedTrades,
                    openPosition
            );

            windowNumber++;
        }

        log.info(
                "Walk-forward optimization completed. "
                        + "Windows evaluated: {}",
                results.size()
        );

        return Collections.unmodifiableList(
                results
        );
    }

    /**
     * Calculates total out-of-sample profit across all
     * walk-forward windows.
     *
     * @param results walk-forward results
     * @return total out-of-sample profit
     */
    public double calculateTotalProfit(
            List<WalkForwardResult> results) {

        Objects.requireNonNull(
                results,
                "Walk-forward results must not be null"
        );

        return results.stream()
                .mapToDouble(
                        WalkForwardResult::getTestingProfit
                )
                .sum();
    }

    /**
     * Represents the result of one walk-forward window.
     */
    public static final class WalkForwardResult {

        private final int windowNumber;

        private final int trainingStart;

        private final int trainingEnd;

        private final int testingStart;

        private final int testingEnd;

        private final StrategyConfig bestConfig;

        private final double testingProfit;

        private final int completedTrades;

        public WalkForwardResult(
                int windowNumber,
                int trainingStart,
                int trainingEnd,
                int testingStart,
                int testingEnd,
                StrategyConfig bestConfig,
                double testingProfit,
                int completedTrades) {

            this.windowNumber = windowNumber;

            this.trainingStart = trainingStart;

            this.trainingEnd = trainingEnd;

            this.testingStart = testingStart;

            this.testingEnd = testingEnd;

            this.bestConfig =
                    Objects.requireNonNull(
                            bestConfig,
                            "Best configuration must not be null"
                    );

            this.testingProfit = testingProfit;

            this.completedTrades = completedTrades;
        }

        public int getWindowNumber() {
            return windowNumber;
        }

        public int getTrainingStart() {
            return trainingStart;
        }

        public int getTrainingEnd() {
            return trainingEnd;
        }

        public int getTestingStart() {
            return testingStart;
        }

        public int getTestingEnd() {
            return testingEnd;
        }

        public StrategyConfig getBestConfig() {
            return bestConfig;
        }

        public double getTestingProfit() {
            return testingProfit;
        }

        public int getCompletedTrades() {
            return completedTrades;
        }
    }
}