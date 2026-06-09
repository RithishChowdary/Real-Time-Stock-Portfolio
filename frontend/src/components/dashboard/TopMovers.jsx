import { useEffect, useMemo, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { getStocks } from "../../services/stockService";

const fallbackStocks = [
  { symbol: "GODREJCP", currentPrice: 1089.69, change: 3.4 },
  { symbol: "GOKEX", currentPrice: 828.55, change: 1.3 },
  { symbol: "TCS", currentPrice: 2406.97, change: -0.16 },
];

function getDemoChange(symbol) {
  const total = symbol
    .split("")
    .reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
  const value = ((total % 700) - 250) / 100;
  return Number(value.toFixed(2));
}

export default function TopMovers() {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadStocks() {
      try {
        const data = await getStocks(0, 50);
        const content = data?.content || [];

        if (isMounted && content.length) {
          setStocks(content);
        } else if (isMounted) {
          setStocks(fallbackStocks);
        }
      } catch {
        if (isMounted) {
          setStocks(fallbackStocks);
        }
      }
    }

    loadStocks();

    return () => {
      isMounted = false;
    };
  }, []);

  const topMovers = useMemo(() => {
    return stocks
      .map((stock) => ({
        ...stock,
        change: getDemoChange(stock.symbol || ""),
      }))
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      .slice(0, 3);
  }, [stocks]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-4">
      <h3 className="text-sm font-semibold text-white mb-3">Top Movers</h3>
      <div className="space-y-2">
        {topMovers.map((stock) => {
          const isPositive = stock.change >= 0;
          return (
            <div
              key={stock.symbol}
              className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-slate-800/50 transition"
            >
              <div className="flex items-center gap-2">
                {isPositive ? (
                  <TrendingUp size={14} className="text-green-500" />
                ) : (
                  <TrendingDown size={14} className="text-red-500" />
                )}
                <span className="text-xs font-semibold text-slate-300">
                  {stock.symbol}
                </span>
              </div>
              <span
                className={`text-xs font-bold ${
                  isPositive
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {isPositive ? "+" : ""}{stock.change.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
