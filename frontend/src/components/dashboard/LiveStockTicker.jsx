import { useRealtime } from "../../hooks/useRealtime";
import { formatCurrency } from "../../utils/formatters";

export default function LiveStockTicker() {
  const realtime = useRealtime();

  if (!realtime?.latestStock) {
    return null;
  }

  const stock = realtime.latestStock;

  function getDemoChange(symbol) {
    const total = symbol
      .split("")
      .reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
    const value = ((total % 700) - 250) / 100;
    return Number(value.toFixed(2));
  }

  const change = getDemoChange(stock.symbol || "");
  const isPositive = change >= 0;

  return (
    <div className="rounded-lg border border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800 p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white">{stock.symbol}</h3>
            <div className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-red-400">LIVE</span>
            </div>
          </div>
          <p className="mt-1 text-xs text-slate-400">{stock.companyName}</p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-white">
            {formatCurrency(stock.currentPrice)}
          </p>
          <p
            className={`mt-1 text-sm font-semibold ${
              isPositive
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {isPositive ? "▲" : "▼"} {isPositive ? "+" : ""}{change.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
}
