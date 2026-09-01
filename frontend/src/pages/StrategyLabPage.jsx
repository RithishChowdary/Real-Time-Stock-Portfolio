import { useState } from "react";
import StrategyLabHeader from "../components/strategy/StrategyLabHeader";
import BacktestConfiguration from "../components/strategy/BacktestConfiguration";
import BacktestSummary from "../components/strategy/BacktestSummary";
import StrategyComparison from "../components/strategy/StrategyComparison";
import WalkForwardResults from "../components/strategy/WalkForwardResults";
import AIAnalysisPanel from "../components/strategy/AIAnalysisPanel";
import { runBacktest, runWalkForward, analyzeBacktest } from "../services/strategyLabService";

export default function StrategyLabPage() {
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedStrategy, setSelectedStrategy] = useState("EMA_RSI");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [results, setResults] = useState(null);
  const [walkForwardResults, setWalkForwardResults] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // AI Analysis states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiError, setAiError] = useState("");

  // When stock selection changes, purge all previous stock results & comparisons
  function handleSelectStock(stock) {
    setSelectedStock(stock);
    setResults(null);
    setWalkForwardResults(null);
    setComparisonData(null);
    setAiAnalysis(null);
    setAiError("");
    setError("");
    setSuccess("");
  }

  // When strategy changes, show matching result for this strategy if previously executed, else null
  function handleSelectStrategy(strategy) {
    setSelectedStrategy(strategy);
    setAiAnalysis(null);
    setAiError("");
    setError("");
    setSuccess("");

    // If this strategy was already executed for the current stock, retrieve its metrics
    if (comparisonData && comparisonData[strategy]) {
      setResults({
        symbol: selectedStock?.symbol,
        strategy: strategy,
        performanceMetrics: comparisonData[strategy],
      });
    } else {
      setResults(null);
    }
  }

  // Real Backtest Execution via POST /api/backtest with specific strategy
  async function handleRunBacktest() {
    if (!selectedStock || !selectedStock.symbol) {
      setError("Please select a valid stock symbol to run the backtest.");
      return;
    }

    setError("");
    setSuccess("");
    setAiAnalysis(null);
    setAiError("");
    setLoading(true);
    setLoadingMessage("Running quantitative strategy backtest...");

    try {
      const data = await runBacktest(selectedStock.symbol, selectedStrategy);

      setResults(data);
      if (data?.performanceMetrics) {
        // Only set metrics for the strategy that was actually executed
        setComparisonData((prev) => ({
          ...prev,
          [selectedStrategy]: data.performanceMetrics,
        }));
      }

      const totalTrades = data?.performanceMetrics?.totalTrades ?? 0;
      const tradeLabel = totalTrades === 1 ? "1 trade evaluated" : `${totalTrades} trades evaluated`;
      const stratLabel = selectedStrategy === "EMA_RSI" ? "EMA + RSI" : "EMA Crossover";

      setSuccess(`Backtest completed for ${selectedStock.symbol} (${stratLabel}: ${tradeLabel}).`);
    } catch (err) {
      setResults(null);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to execute backtest. Please check historical data availability or network connection."
      );
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  }

  // Real Walk-Forward Optimization via POST /api/backtest/walk-forward
  async function handleRunWalkForward() {
    if (!selectedStock || !selectedStock.symbol) {
      setError("Please select a valid stock symbol for walk-forward optimization.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);
    setLoadingMessage("Running walk-forward out-of-sample optimization...");

    try {
      const data = await runWalkForward(selectedStock.symbol);
      setWalkForwardResults(data);
      const windowsCount = data?.windowsEvaluated ?? 0;
      const windowLabel = windowsCount === 1 ? "1 rolling window" : `${windowsCount} rolling windows`;
      setSuccess(`Walk-forward optimization completed for ${selectedStock.symbol} (${windowLabel}).`);
    } catch (err) {
      setWalkForwardResults(null);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to execute walk-forward optimization. Please check historical data availability."
      );
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  }

  // Real AI Quantitative Analysis via POST /api/backtest/analysis
  async function handleAnalyzeWithAI() {
    if (!results || !results.performanceMetrics) {
      setAiError("Please run a backtest first to generate quantitative metrics for AI analysis.");
      return;
    }

    setAiError("");
    setAiLoading(true);

    const metrics = results.performanceMetrics;
    const payload = {
      symbol: selectedStock?.symbol || results.symbol || "UNKNOWN",
      strategy: selectedStrategy === "EMA_RSI" ? "EMA + RSI Momentum" : "EMA Dual Crossover",
      totalTrades: metrics.totalTrades ?? 0,
      winningTrades: metrics.winningTrades ?? 0,
      losingTrades: metrics.losingTrades ?? 0,
      winRate: metrics.winRate ?? 0,
      totalProfit: metrics.totalProfit ?? 0,
      totalLoss: metrics.totalLoss ?? 0,
      totalEarnings: metrics.totalEarnings ?? 0,
      averageProfit: metrics.averageProfit ?? 0,
      maximumDrawdown: metrics.maximumDrawdown ?? 0,
      profitFactor: metrics.profitFactor ?? 0,
    };

    try {
      const analysisData = await analyzeBacktest(payload);
      setAiAnalysis(analysisData);
    } catch (err) {
      setAiAnalysis(null);
      setAiError(
        err.response?.data?.message ||
        err.message ||
        "Unable to generate AI analysis. Please ensure AI configuration is active."
      );
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <StrategyLabHeader />

      {/* Global Alerts */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-300">
          {success}
        </div>
      )}

      {loading && loadingMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3.5 text-xs font-semibold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300 animate-pulse">
          <span>{loadingMessage}</span>
        </div>
      )}

      {/* Main Grid: Configuration + Backtest Metrics */}
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <div className="space-y-6">
          <BacktestConfiguration
            selectedStock={selectedStock}
            onSelectStock={handleSelectStock}
            selectedStrategy={selectedStrategy}
            onSelectStrategy={handleSelectStrategy}
            onRunBacktest={handleRunBacktest}
            onRunWalkForward={handleRunWalkForward}
            loading={loading}
          />
        </div>

        <div className="space-y-6">
          {/* Backtest Metrics Summary */}
          <BacktestSummary
            results={results}
            symbol={selectedStock?.symbol}
            strategyName={selectedStrategy === "EMA_RSI" ? "EMA + RSI Momentum" : "EMA Dual Crossover"}
          />

          {/* Strategy Comparison */}
          <StrategyComparison comparisonData={comparisonData} />
        </div>
      </div>

      {/* Walk-Forward Rolling Window Analysis */}
      <WalkForwardResults walkForwardData={walkForwardResults} />

      {/* AI Quantitative Analysis */}
      <AIAnalysisPanel
        hasResults={Boolean(results?.performanceMetrics)}
        onAnalyze={handleAnalyzeWithAI}
        loading={aiLoading}
        analysis={aiAnalysis}
        error={aiError}
      />
    </div>
  );
}