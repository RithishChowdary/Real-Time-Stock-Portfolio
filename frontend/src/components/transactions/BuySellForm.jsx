import { useEffect, useState, useMemo } from "react";
import { Search, AlertCircle } from "lucide-react";
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
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9AA1A9]">
          Target Portfolio
        </span>
        <select
          value={portfolioId}
          onChange={(e) => setPortfolioId(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#3B82F6] dark:border-[#2A2E32] dark:bg-[#141719] dark:text-[#F1F3F5] dark:focus:border-[#3B82F6]"
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
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9AA1A9]">
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
              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#3B82F6] dark:border-[#2A2E32] dark:bg-[#141719] dark:text-[#F1F3F5] dark:placeholder-[#6F7780] dark:focus:border-[#3B82F6]"
            />
            <Search className="absolute left-3.5 top-3 text-slate-400 dark:text-[#6F7780]" size={16} />
          </div>
        </label>

        {/* Autocomplete Dropdown */}
        {searchResults.length > 0 && !selectedStock && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-xl dark:border-[#2A2E32] dark:bg-[#181B1D]">
            {searchResults.map((stock) => (
              <button
                key={stock.id || stock.symbol}
                type="button"
                onClick={() => handleSelectStock(stock)}
                className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 dark:border-[#2A2E32] dark:hover:bg-[#1D2023] cursor-pointer"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-[#F1F3F5]">
                    {stock.symbol}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-[#9AA1A9]">
                    {stock.companyName}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-slate-800 dark:text-[#F1F3F5]">
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
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-[#2A2E32] dark:bg-[#141719]">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900 dark:text-[#F1F3F5]">
                  {selectedStock.symbol}
                </span>
                <span className="rounded bg-[#3B82F6]/10 px-2 py-0.5 text-[11px] font-semibold text-[#3B82F6] border border-[#3B82F6]/20">
                  NSE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#9AA1A9]">
                {selectedStock.companyName}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 dark:text-[#9AA1A9]">
                Market Price
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-[#F1F3F5]">
                {loadingPrice ? (
                  <span className="text-xs font-normal text-[#3B82F6] animate-pulse">Loading price...</span>
                ) : (
                  formatCurrency(marketPrice)
                )}
              </p>
            </div>
          </div>

          {!isBuy && (
            <div className="mt-2.5 flex items-center justify-between border-t border-slate-200 pt-2 dark:border-[#2A2E32]">
              <span className="text-xs font-medium text-slate-600 dark:text-[#9AA1A9]">
                Owned in Portfolio:
              </span>
              <span className={`text-xs font-bold ${ownedQuantity > 0 ? "text-slate-900 dark:text-[#F1F3F5]" : "text-amber-500"}`}>
                {ownedQuantity} shares
              </span>
            </div>
          )}
        </div>
      )}

      {/* Quantity & Execution Price Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9AA1A9]">
            Quantity
          </span>
          <input
            type="number"
            min="1"
            step="1"
            placeholder="e.g. 10"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#3B82F6] dark:border-[#2A2E32] dark:bg-[#141719] dark:text-[#F1F3F5] dark:focus:border-[#3B82F6]"
          />
        </label>

        <label className="block">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9AA1A9]">
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
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#3B82F6] dark:border-[#2A2E32] dark:bg-[#141719] dark:text-[#F1F3F5] dark:focus:border-[#3B82F6]"
          />
        </label>
      </div>

      <p className="text-[11px] text-slate-400 dark:text-[#6F7780]">
        * Execution price defaults to live market quote and is customizable for paper simulation.
      </p>

      {/* Financial Breakdown Card */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-[#2A2E32] dark:bg-[#141719]">
        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-slate-600 dark:text-[#9AA1A9]">
            <span>{isBuy ? "Estimated Order Value" : "Estimated Proceeds"}</span>
            <span className="font-semibold text-slate-900 dark:text-[#F1F3F5]">
              {formatCurrency(orderValue)}
            </span>
          </div>

          <div className="flex justify-between text-slate-600 dark:text-[#9AA1A9]">
            <span>Available Cash</span>
            <span className="font-semibold text-slate-900 dark:text-[#F1F3F5]">
              {formatCurrency(currentCash)}
            </span>
          </div>

          <div className="border-t border-slate-200 pt-2 flex justify-between font-semibold dark:border-[#2A2E32]">
            <span className="text-slate-700 dark:text-[#9AA1A9]">After Trade Cash</span>
            <span className={afterTradeCash < 0 ? "text-[#FF4D5A] font-bold" : "text-[#00C896] font-bold"}>
              {formatCurrency(afterTradeCash)}
            </span>
          </div>
        </div>
      </div>

      {/* Validation / Local Error Alerts */}
      {(validationError || localError) && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
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