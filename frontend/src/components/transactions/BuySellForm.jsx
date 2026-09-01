import { useEffect, useState, useMemo } from "react";
import { Search, AlertCircle, ArrowRight, CheckCircle2, TrendingUp, Info } from "lucide-react";
import Button from "../ui/Button";
import { getLivePrice, searchStocks } from "../../services/stockService";
import { formatCurrency } from "../../utils/formatters";

export default function BuySellForm({
  portfolios,
  defaultPortfolioId,
  mode = "BUY",
  holdings = [],
  availableCash = 0,
  onSubmit,
}) {
  const [portfolioId, setPortfolioId] = useState(defaultPortfolioId || "");
  const [stockSearch, setStockSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [marketPrice, setMarketPrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  const [quantity, setQuantity] = useState("");
  const [executionPrice, setExecutionPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  const isBuy = mode === "BUY";

  // Sync default portfolio ID
  useEffect(() => {
    if (defaultPortfolioId) {
      setPortfolioId(defaultPortfolioId);
    } else if (portfolios && portfolios.length > 0 && !portfolioId) {
      setPortfolioId(portfolios[0].id);
    }
  }, [defaultPortfolioId, portfolios]);

  // Debounced stock search
  useEffect(() => {
    if (!stockSearch || stockSearch.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    // Don't search if user selected the stock and search matches symbol
    if (selectedStock && stockSearch.toUpperCase() === selectedStock.symbol.toUpperCase()) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await searchStocks(stockSearch.trim());
        setSearchResults(data.slice(0, 6));
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [stockSearch, selectedStock]);

  // When stock is chosen, load live price and default execution price
  async function handleSelectStock(stock) {
    setSelectedStock(stock);
    setStockSearch(stock.symbol);
    setSearchResults([]);
    setLocalError("");

    setLoadingPrice(true);
    try {
      const price = await getLivePrice(stock.symbol);
      const parsedPrice = Number(price || stock.currentPrice || 0);
      setMarketPrice(parsedPrice);
      setExecutionPrice(parsedPrice.toFixed(2));
    } catch {
      const fallbackPrice = Number(stock.currentPrice || 0);
      setMarketPrice(fallbackPrice);
      setExecutionPrice(fallbackPrice.toFixed(2));
    } finally {
      setLoadingPrice(false);
    }
  }

  // Find owned quantity for the selected stock in the active portfolio
  const ownedQuantity = useMemo(() => {
    if (!selectedStock || !holdings) return 0;
    const holding = holdings.find(
      (h) => h.symbol.toUpperCase() === selectedStock.symbol.toUpperCase()
    );
    return holding ? Number(holding.quantity) : 0;
  }, [selectedStock, holdings]);

  // Numeric calculations
  const parsedQty = parseInt(quantity, 10) || 0;
  const parsedPrice = parseFloat(executionPrice) || 0;
  const orderValue = parsedQty > 0 && parsedPrice > 0 ? parsedQty * parsedPrice : 0;

  const currentCash = Number(availableCash) || 0;
  const afterTradeCash = isBuy
    ? currentCash - orderValue
    : currentCash + orderValue;

  const isInsufficientFunds = isBuy && orderValue > currentCash;
  const isInsufficientHoldings = !isBuy && (parsedQty > ownedQuantity || ownedQuantity <= 0);

  // Form validation errors
  const validationError = useMemo(() => {
    if (!selectedStock) return null;
    if (quantity !== "" && (parsedQty <= 0 || !Number.isInteger(Number(quantity)))) {
      return "Quantity must be a positive whole number (at least 1)";
    }
    if (executionPrice !== "" && parsedPrice <= 0) {
      return "Execution price must be greater than ₹0.00";
    }
    if (isBuy && isInsufficientFunds && parsedQty > 0) {
      return `Insufficient funds. Required: ${formatCurrency(orderValue)}, Available: ${formatCurrency(currentCash)}`;
    }
    if (!isBuy && isInsufficientHoldings && parsedQty > 0) {
      return `Insufficient holdings. You own ${ownedQuantity} ${selectedStock.symbol} shares.`;
    }
    return null;
  }, [
    selectedStock,
    quantity,
    parsedQty,
    executionPrice,
    parsedPrice,
    isBuy,
    isInsufficientFunds,
    isInsufficientHoldings,
    orderValue,
    currentCash,
    ownedQuantity,
  ]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLocalError("");

    if (!portfolioId) {
      setLocalError("Please select a portfolio.");
      return;
    }
    if (!selectedStock) {
      setLocalError("Please select a stock to trade.");
      return;
    }
    if (parsedQty <= 0) {
      setLocalError("Quantity must be at least 1.");
      return;
    }
    if (parsedPrice <= 0) {
      setLocalError("Execution price must be greater than 0.");
      return;
    }
    if (isBuy && isInsufficientFunds) {
      setLocalError(`Insufficient funds. Available: ${formatCurrency(currentCash)}, Required: ${formatCurrency(orderValue)}`);
      return;
    }
    if (!isBuy && isInsufficientHoldings) {
      setLocalError(`Insufficient holdings. You own ${ownedQuantity} ${selectedStock.symbol} shares.`);
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        portfolioId: Number(portfolioId),
        symbol: selectedStock.symbol.trim().toUpperCase(),
        quantity: parsedQty,
        price: parsedPrice,
      });

      // Clear input fields on success
      setQuantity("");
    } catch (err) {
      setLocalError(err.response?.data?.message || err.message || "Transaction failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Portfolio Selector */}
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Target Portfolio
        </span>
        <select
          value={portfolioId}
          onChange={(e) => setPortfolioId(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-500"
        >
          <option value="">Select portfolio</option>
          {portfolios.map((p) => (
            <option key={p.id} value={p.id}>
              {p.portfolioName}
            </option>
          ))}
        </select>
      </label>

      {/* Stock Search & Autocomplete */}
      <div className="relative">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Stock Symbol / Company
          </span>
          <div className="relative">
            <input
              type="text"
              value={stockSearch}
              placeholder="Search TCS, RELIANCE, INFY..."
              onChange={(e) => {
                setStockSearch(e.target.value);
                if (selectedStock && e.target.value !== selectedStock.symbol) {
                  setSelectedStock(null);
                  setMarketPrice(null);
                  setExecutionPrice("");
                }
              }}
              className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500"
            />
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          </div>
        </label>

        {/* Autocomplete Dropdown */}
        {searchResults.length > 0 && !selectedStock && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
            {searchResults.map((stock) => (
              <button
                key={stock.id || stock.symbol}
                type="button"
                onClick={() => handleSelectStock(stock)}
                className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {stock.symbol}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {stock.companyName}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {formatCurrency(stock.currentPrice)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Stock Live Quote Card */}
      {selectedStock && (
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedStock.symbol}
                </span>
                <span className="rounded bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  NSE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedStock.companyName}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Market Price
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {loadingPrice ? (
                  <span className="text-xs font-normal text-blue-600 animate-pulse">Loading price...</span>
                ) : (
                  formatCurrency(marketPrice)
                )}
              </p>
            </div>
          </div>

          {!isBuy && (
            <div className="mt-2.5 flex items-center justify-between border-t border-slate-200 pt-2 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Owned in Portfolio:
              </span>
              <span className={`text-xs font-bold ${ownedQuantity > 0 ? "text-slate-900 dark:text-white" : "text-amber-600"}`}>
                {ownedQuantity} shares
              </span>
            </div>
          )}
        </div>
      )}

      {/* Quantity & Execution Price Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Quantity
          </span>
          <input
            type="number"
            min="1"
            step="1"
            placeholder="e.g. 10"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-500"
          />
        </label>

        <label className="block">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Exec. Price (₹)
            </span>
          </div>
          <input
            type="number"
            min="0.01"
            step="any"
            placeholder="e.g. 2354.50"
            value={executionPrice}
            onChange={(e) => setExecutionPrice(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-500"
          />
        </label>
      </div>

      <p className="text-[11px] text-slate-400 dark:text-slate-500">
        * Execution price defaults to live market quote and is customizable for paper simulation.
      </p>

      {/* Financial Breakdown / Demat Preview Card */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>{isBuy ? "Estimated Order Value" : "Estimated Proceeds"}</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {formatCurrency(orderValue)}
            </span>
          </div>

          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Available Cash</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {formatCurrency(currentCash)}
            </span>
          </div>

          <div className="border-t border-slate-200 pt-2 flex justify-between font-semibold dark:border-slate-700">
            <span className="text-slate-700 dark:text-slate-300">After Trade Cash</span>
            <span className={afterTradeCash < 0 ? "text-red-600 font-bold" : "text-emerald-600 dark:text-emerald-400 font-bold"}>
              {formatCurrency(afterTradeCash)}
            </span>
          </div>
        </div>
      </div>

      {/* Validation / Local Error Alerts */}
      {(validationError || localError) && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{localError || validationError}</span>
        </div>
      )}

      {/* Trade Action Button */}
      <Button
        type="submit"
        disabled={
          submitting ||
          !selectedStock ||
          parsedQty <= 0 ||
          parsedPrice <= 0 ||
          Boolean(validationError)
        }
        variant={isBuy ? "primary" : "danger"}
        className="w-full py-3 text-sm font-bold shadow-sm"
      >
        {submitting
          ? "Placing order..."
          : isBuy
          ? `BUY ${selectedStock?.symbol || "STOCK"}`
          : `SELL ${selectedStock?.symbol || "STOCK"}`}
      </Button>
    </form>
  );
}