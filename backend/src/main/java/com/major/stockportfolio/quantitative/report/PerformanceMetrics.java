package com.major.stockportfolio.quantitative.report;

/**
 * Represents calculated performance metrics of a backtest.
 *
 * This class is an immutable data holder.
 * Calculation logic remains outside this class in PerformanceMetricsCalculator.
 */
public class PerformanceMetrics {

    private final int totalTrades;
    private final int winningTrades;
    private final int losingTrades;

    private final double winRate;

    /**
     * Gross profit from successful trades only.
     */
    private final double totalProfit;

    /**
     * Gross loss from losing trades only.
     * Stored as a positive value for reporting.
     */
    private final double totalLoss;

    /**
     * Account-level return: final portfolio equity minus initial capital.
     * Includes open holdings marked to market.
     */
    private final double totalEarnings;

    /**
     * Average net P&L per completed trade (trade-level, not account-level).
     */
    private final double averageProfit;

    /**
     * Maximum peak-to-trough drawdown as a percentage of peak account equity.
     */
    private final double maximumDrawdown;
    private final double profitFactor;
    private final boolean profitFactorDefined;

    // Capital & ROI Metrics
    private final double initialCapital;
    private final double finalPortfolioValue;
    private final double returnOnInvestment;

    // Trade-level statistics are based on completed positions only.
    private final double expectancy;
    private final double averageWinningTrade;
    private final double averageLosingTrade;
    private final Double riskRewardRatio;
    private final Double sharpeRatio;

    /**
     * Backward-compatible 10-parameter constructor.
     * Defaults initial capital to 100,000.0 and derives capital and trade statistics.
     */
    public PerformanceMetrics(
            int totalTrades,
            int winningTrades,
            int losingTrades,
            double winRate,
            double totalProfit,
            double totalLoss,
            double totalEarnings,
            double averageProfit,
            double maximumDrawdown,
            double profitFactor) {

        this(
                totalTrades,
                winningTrades,
                losingTrades,
                winRate,
                totalProfit,
                totalLoss,
                totalEarnings,
                averageProfit,
                maximumDrawdown,
                profitFactor,
                100000.0,
                100000.0 + totalEarnings,
                (totalEarnings / 100000.0) * 100.0,
                averageProfit,
                winningTrades > 0 ? totalProfit / winningTrades : 0.0,
                losingTrades > 0 ? totalLoss / losingTrades : 0.0,
                (losingTrades > 0 && (totalLoss / losingTrades) > 0 && winningTrades > 0)
                        ? (totalProfit / winningTrades) / (totalLoss / losingTrades)
                        : null,
                null
        );
    }

    /**
     * Source-compatible overload for callers that represent an undefined
     * profit factor with {@code null}. The primitive getter returns 0.0 for
     * this case; use {@link #isProfitFactorDefined()} to distinguish it.
     */
    public PerformanceMetrics(
            int totalTrades,
            int winningTrades,
            int losingTrades,
            double winRate,
            double totalProfit,
            double totalLoss,
            double totalEarnings,
            double averageProfit,
            double maximumDrawdown,
            Double profitFactor) {

        this(
                totalTrades,
                winningTrades,
                losingTrades,
                winRate,
                totalProfit,
                totalLoss,
                totalEarnings,
                averageProfit,
                maximumDrawdown,
                profitFactor == null ? 0.0 : profitFactor.doubleValue(),
                profitFactor != null,
                100000.0,
                100000.0 + totalEarnings,
                (totalEarnings / 100000.0) * 100.0,
                averageProfit,
                winningTrades > 0 ? totalProfit / winningTrades : 0.0,
                losingTrades > 0 ? totalLoss / losingTrades : 0.0,
                (losingTrades > 0 && (totalLoss / losingTrades) > 0 && winningTrades > 0)
                        ? (totalProfit / winningTrades) / (totalLoss / losingTrades)
                        : null,
                null
        );
    }

    /**
     * Comprehensive constructor with all quantitative performance metrics.
     */
    public PerformanceMetrics(
            int totalTrades,
            int winningTrades,
            int losingTrades,
            double winRate,
            double totalProfit,
            double totalLoss,
            double totalEarnings,
            double averageProfit,
            double maximumDrawdown,
            Double profitFactor,
            double initialCapital,
            double finalPortfolioValue,
            double returnOnInvestment,
            double expectancy,
            double averageWinningTrade,
            double averageLosingTrade,
            Double riskRewardRatio,
            Double sharpeRatio) {
        this(
                totalTrades,
                winningTrades,
                losingTrades,
                winRate,
                totalProfit,
                totalLoss,
                totalEarnings,
                averageProfit,
                maximumDrawdown,
                profitFactor == null ? 0.0 : profitFactor.doubleValue(),
                profitFactor != null,
                initialCapital,
                finalPortfolioValue,
                returnOnInvestment,
                expectancy,
                averageWinningTrade,
                averageLosingTrade,
                riskRewardRatio,
                sharpeRatio
        );
    }

    private PerformanceMetrics(
            int totalTrades,
            int winningTrades,
            int losingTrades,
            double winRate,
            double totalProfit,
            double totalLoss,
            double totalEarnings,
            double averageProfit,
            double maximumDrawdown,
            double profitFactor,
            boolean profitFactorDefined,
            double initialCapital,
            double finalPortfolioValue,
            double returnOnInvestment,
            double expectancy,
            double averageWinningTrade,
            double averageLosingTrade,
            Double riskRewardRatio,
            Double sharpeRatio) {

        this.totalTrades = totalTrades;
        this.winningTrades = winningTrades;
        this.losingTrades = losingTrades;
        this.winRate = winRate;
        this.totalProfit = totalProfit;
        this.totalLoss = totalLoss;
        this.totalEarnings = totalEarnings;
        this.averageProfit = averageProfit;
        this.maximumDrawdown = maximumDrawdown;
        this.profitFactor = profitFactor;
        this.profitFactorDefined = profitFactorDefined;

        this.initialCapital = initialCapital;
        this.finalPortfolioValue = finalPortfolioValue;
        this.returnOnInvestment = returnOnInvestment;
        this.expectancy = expectancy;
        this.averageWinningTrade = averageWinningTrade;
        this.averageLosingTrade = averageLosingTrade;
        this.riskRewardRatio = riskRewardRatio;
        this.sharpeRatio = sharpeRatio;
    }

    public int getTotalTrades() {
        return totalTrades;
    }

    public int getWinningTrades() {
        return winningTrades;
    }

    public int getLosingTrades() {
        return losingTrades;
    }

    public double getWinRate() {
        return winRate;
    }

    public double getTotalProfit() {
        return totalProfit;
    }

    public double getTotalLoss() {
        return totalLoss;
    }

    public double getTotalEarnings() {
        return totalEarnings;
    }

    public double getAverageProfit() {
        return averageProfit;
    }

    public double getMaximumDrawdown() {
        return maximumDrawdown;
    }

    public double getProfitFactor() {
        return profitFactor;
    }

    /**
     * Indicates whether gross loss was non-zero and the profit factor is
     * mathematically defined.
     */
    public boolean isProfitFactorDefined() {
        return profitFactorDefined;
    }

    public double getInitialCapital() {
        return initialCapital;
    }

    public double getFinalPortfolioValue() {
        return finalPortfolioValue;
    }

    public double getReturnOnInvestment() {
        return returnOnInvestment;
    }

    /**
     * Convenience alias for returnOnInvestment used in JSON serialization / consumers.
     */
    public double getRoi() {
        return returnOnInvestment;
    }

    public double getExpectancy() {
        return expectancy;
    }

    public double getAverageWinningTrade() {
        return averageWinningTrade;
    }

    public double getAverageLosingTrade() {
        return averageLosingTrade;
    }

    public Double getRiskRewardRatio() {
        return riskRewardRatio;
    }

    public Double getSharpeRatio() {
        return sharpeRatio;
    }
}
