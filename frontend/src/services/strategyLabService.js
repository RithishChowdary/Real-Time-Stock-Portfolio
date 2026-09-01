import axiosClient from "../api/axiosClient";

/**
 * Executes a quantitative strategy backtest using TA4J on the backend.
 * @param {string} symbol - Stock symbol (e.g. 'TCS', 'RELIANCE', 'INFY')
 * @param {string} strategy - Strategy identifier (e.g. 'EMA_RSI', 'EMA_CROSSOVER')
 * @returns {Promise<Object>} BacktestResponse containing performanceMetrics and strategy
 */
export async function runBacktest(symbol, strategy = "EMA_RSI") {
  const response = await axiosClient.post("/backtest", {
    symbol: symbol.trim().toUpperCase(),
    strategy: strategy,
  });
  return response.data;
}

/**
 * Executes walk-forward out-of-sample quantitative optimization on the backend.
 * @param {string} symbol - Stock symbol (e.g. 'TCS', 'RELIANCE', 'INFY')
 * @returns {Promise<Object>} WalkForwardBacktestResponse with evaluated windows
 */
export async function runWalkForward(symbol) {
  const response = await axiosClient.post("/backtest/walk-forward", {
    symbol: symbol.trim().toUpperCase(),
  });
  return response.data;
}

/**
 * Requests AI-powered quantitative explanation of real backtest performance metrics.
 * @param {Object} payload - AIAnalysisRequest with symbol, strategy, and real metrics
 * @returns {Promise<Object>} AIAnalysisResponse
 */
export async function analyzeBacktest(payload) {
  const response = await axiosClient.post("/backtest/analysis", payload);
  return response.data;
}
