import { useEffect, useMemo, useState } from "react";
import { getStocks } from "../../services/stockService";

const fallbackStocks = [
  { symbol: "TCS", companyName: "Tata Consultancy Services", currentPrice: 2406.97 },
  { symbol: "GOKEX", companyName: "Gokaldas Exports Ltd", currentPrice: 828.55 },
  { symbol: "INFY", companyName: "Infosys", currentPrice: 1484.8 },
  { symbol: "RELIANCE", companyName: "Reliance Industries", currentPrice: 2930.4 },
  { symbol: "HDFCBANK", companyName: "HDFC Bank", currentPrice: 1692.35 },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
}

function getDemoChange(symbol) {
  const total = symbol
    .split("")
    .reduce((sum, letter) => sum + letter.charCodeAt(0), 0);

  const value = ((total % 700) - 250) / 100;
  return Number(value.toFixed(2));
}

export default function MarketTicker() {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadStocks() {
      try {
        const data = await getStocks(0, 20);
        const content = data?.content || [];

        if (isMounted) {
          setStocks(content.length ? content : fallbackStocks);
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

  const tickerItems = useMemo(() => {
    const items = stocks.length ? stocks : fallbackStocks;
    return [...items, ...items];
  }, [stocks]);

  return (
    <div className="market-ticker overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl">
      <div className="market-ticker__viewport py-2 text-sm">
        <div className="market-ticker__track">
          <div className="market-ticker__badge">
            <span className="market-ticker__flag animate-pulse">
              LIVE
            </span>

          <span className="font-semibold text-slate-900 dark:text-white">
            NSE Market
          </span>
        </div>

          {tickerItems.map((stock, index) => {
            const change = getDemoChange(stock.symbol || "");
            const isPositive = change >= 0;

            return (
                    <div
        key={`${stock.symbol}-${index}`}
        className="market-ticker__item hover:scale-105 transition-transform duration-200"
      >
                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-sm font-semibold text-blue-400 border border-blue-500/20">
                  {stock.symbol}
                </span>

                <span className="font-mono text-sm font-semibold text-white">
                  {formatCurrency(stock.currentPrice)}
                </span>
                <span
                  className={`font-mono text-sm font-bold ${
                    isPositive
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {isPositive ? "▲" : "▼"}{" "}
                  {isPositive ? "+" : ""}
                  {change.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}