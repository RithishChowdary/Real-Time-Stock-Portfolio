import { useEffect, useState } from "react";
import { Search, Play, Sliders, Info, ShieldCheck } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { searchStocks } from "../../services/stockService";
import { formatCurrency } from "../../utils/formatters";

export const SUPPORTED_STRATEGIES = [
  {
    id: "EMA_RSI",
    name: "EMA + RSI Momentum",
    description:
      "Fast & Slow EMA trend crossover with RSI momentum confirmation to filter false breakouts.",
    indicators: "EMA (9, 20), RSI (14)",
  },
  {
    id: "EMA_CROSSOVER",
    name: "EMA Dual Crossover",
    description:
      "Classic exponential moving average trend-following strategy with fast & slow period crossings.",
    indicators: "Fast EMA (9), Slow EMA (20)",
  },
];

export default function BacktestConfiguration({
  selectedStock,
  onSelectStock,
  selectedStrategy,
  onSelectStrategy,
  onRunBacktest,
  onRunWalkForward,
  loading = false,
}) {
  const [stockSearch, setStockSearch] = useState(selectedStock?.symbol || "");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced stock search
  useEffect(() => {
    if (!stockSearch || stockSearch.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    if (selectedStock && stockSearch.toUpperCase() === selectedStock.symbol.toUpperCase()) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await searchStocks(stockSearch.trim());
        setSearchResults(data.slice(0, 5));
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [stockSearch, selectedStock]);

  function handleChooseStock(stock) {
    onSelectStock(stock);
    setStockSearch(stock.symbol);
    setSearchResults([]);
  }

  const currentStrategyInfo = SUPPORTED_STRATEGIES.find(
    (s) => s.id === selectedStrategy
  ) || SUPPORTED_STRATEGIES[0];

  return (
    <Card className="border border-slate-200 dark:border-slate-800">
      <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Backtest Configuration
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select an asset and strategy to evaluate historical performance.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Sliders size={14} />
            <span>Parameters</span>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {/* Stock Search */}
        <div className="relative">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Target Stock
            </span>
            <div className="relative">
              <input
                type="text"
                value={stockSearch}
                placeholder="Search stock (e.g. TCS, RELIANCE, INFY)..."
                onChange={(e) => {
                  setStockSearch(e.target.value);
                  if (selectedStock && e.target.value !== selectedStock.symbol) {
                    onSelectStock(null);
                  }
                }}
                className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-500"
              />
              <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            </div>
          </label>

          {/* Autocomplete Results */}
          {searchResults.length > 0 && !selectedStock && (
            <div className="absolute z-50 mt-1 max-h-52 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
              {searchResults.map((stock) => (
                <button
                  key={stock.id || stock.symbol}
                  type="button"
                  onClick={() => handleChooseStock(stock)}
                  className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-2.5 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {stock.symbol}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {stock.companyName}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {formatCurrency(stock.currentPrice)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Stock Banner */}
        {selectedStock && (
          <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50/60 p-3 dark:border-blue-900/40 dark:bg-blue-950/20">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedStock.symbol}
                </span>
                <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[10px] font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  NSE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedStock.companyName}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500">Market Price</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {formatCurrency(selectedStock.currentPrice)}
              </p>
            </div>
          </div>
        )}

        {/* Strategy Selection */}
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Quantitative Strategy
          </span>
          <select
            value={selectedStrategy}
            onChange={(e) => onSelectStrategy(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-500"
          >
            {SUPPORTED_STRATEGIES.map((strategy) => (
              <option key={strategy.id} value={strategy.id}>
                {strategy.name}
              </option>
            ))}
          </select>
        </label>

        {/* Strategy Info Box */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="flex items-start gap-2">
            <Info size={15} className="mt-0.5 text-blue-500 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {currentStrategyInfo.name}
              </span>
              <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                {currentStrategyInfo.description}
              </p>
              <p className="mt-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                Indicators: {currentStrategyInfo.indicators}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid gap-2 pt-1 sm:grid-cols-2">
          <Button
            type="button"
            onClick={onRunBacktest}
            disabled={!selectedStock || loading}
            variant="primary"
            className="w-full py-2.5 text-xs font-bold shadow-sm"
          >
            <Play size={14} />
            {loading ? "Running Backtest..." : "Run Backtest"}
          </Button>

          <Button
            type="button"
            onClick={onRunWalkForward}
            disabled={!selectedStock || loading}
            variant="secondary"
            className="w-full py-2.5 text-xs font-bold"
          >
            <Sliders size={14} />
            Walk-Forward Test
          </Button>
        </div>
      </div>
    </Card>
  );
}
