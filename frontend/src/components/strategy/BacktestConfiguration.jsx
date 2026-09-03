import { useEffect, useState } from "react";
import { Search, Play, Sliders, Info } from "lucide-react";
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
    <Card className="border border-slate-200 dark:border-[#2A2E32] bg-white dark:bg-[#181B1D]">
      <div className="border-b border-slate-200 pb-3 dark:border-[#2A2E32]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-[#F1F3F5]">
              Backtest Configuration
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#9AA1A9]">
              Select an asset and strategy to evaluate historical performance.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-[#9AA1A9]">
            <Sliders size={14} />
            <span>Parameters</span>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {/* Stock Search */}
        <div className="relative">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9AA1A9]">
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
                className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#3B82F6] dark:border-[#2A2E32] dark:bg-[#141719] dark:text-[#F1F3F5] dark:placeholder-[#6F7780] dark:focus:border-[#3B82F6]"
              />
              <Search className="absolute left-3.5 top-3 text-slate-400 dark:text-[#6F7780]" size={16} />
            </div>
          </label>

          {/* Autocomplete Results */}
          {searchResults.length > 0 && !selectedStock && (
            <div className="absolute z-50 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-xl dark:border-[#2A2E32] dark:bg-[#181B1D]">
              {searchResults.map((stock) => (
                <button
                  key={stock.id || stock.symbol}
                  type="button"
                  onClick={() => handleChooseStock(stock)}
                  className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-2.5 text-left transition hover:bg-slate-50 dark:border-[#2A2E32] dark:hover:bg-[#1D2023] cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-[#F1F3F5]">
                      {stock.symbol}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-[#9AA1A9]">
                      {stock.companyName}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-[#F1F3F5]">
                    {formatCurrency(stock.currentPrice)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Stock Banner */}
        {selectedStock && (
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#2A2E32] dark:bg-[#141719]">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-[#F1F3F5]">
                  {selectedStock.symbol}
                </span>
                <span className="rounded bg-[#3B82F6]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#3B82F6] border border-[#3B82F6]/20">
                  NSE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#9AA1A9]">
                {selectedStock.companyName}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 dark:text-[#9AA1A9]">Market Price</span>
              <p className="text-sm font-bold text-slate-900 dark:text-[#F1F3F5]">
                {formatCurrency(selectedStock.currentPrice)}
              </p>
            </div>
          </div>
        )}

        {/* Strategy Selection */}
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9AA1A9]">
            Quantitative Strategy
          </span>
          <select
            value={selectedStrategy}
            onChange={(e) => onSelectStrategy(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#3B82F6] dark:border-[#2A2E32] dark:bg-[#141719] dark:text-[#F1F3F5] dark:focus:border-[#3B82F6]"
          >
            {SUPPORTED_STRATEGIES.map((strategy) => (
              <option key={strategy.id} value={strategy.id}>
                {strategy.name}
              </option>
            ))}
          </select>
        </label>

        {/* Strategy Info Box */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#2A2E32] dark:bg-[#141719]">
          <div className="flex items-start gap-2">
            <Info size={15} className="mt-0.5 text-[#3B82F6] shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-slate-800 dark:text-[#F1F3F5]">
                {currentStrategyInfo.name}
              </span>
              <p className="mt-0.5 text-slate-500 dark:text-[#9AA1A9]">
                {currentStrategyInfo.description}
              </p>
              <p className="mt-1 text-[11px] font-medium text-slate-400 dark:text-[#6F7780]">
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
            className="w-full py-2.5 text-xs font-bold"
          >
            <Play size={14} />
            {loading ? "Running..." : "Run Backtest"}
          </Button>

          <Button
            type="button"
            onClick={onRunWalkForward}
            disabled={!selectedStock || loading}
            variant="secondary"
            className="w-full py-2.5 text-xs font-bold"
          >
            <Sliders size={14} />
            Walk-Forward
          </Button>
        </div>
      </div>
    </Card>
  );
}
