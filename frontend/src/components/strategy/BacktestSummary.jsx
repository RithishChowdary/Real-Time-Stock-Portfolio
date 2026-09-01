import {
  TrendingUp,
  TrendingDown,
  Activity,
  Percent,
  Target,
  BarChart2,
  ShieldAlert,
  Award,
} from "lucide-react";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import { formatCurrency, formatPercentage } from "../../utils/formatters";

export default function BacktestSummary({ results, symbol, strategyName }) {
  if (!results) {
    return (
      <Card className="border border-slate-200 dark:border-slate-800">
        <EmptyState
          title="No backtest results yet"
          message="Select an Indian stock and run a quantitative strategy backtest to view execution metrics."
        />
      </Card>
    );
  }

  const metrics = results.performanceMetrics || results;

  const totalEarningsNum = metrics.totalEarnings !== undefined ? Number(metrics.totalEarnings) : null;
  const isProfit = totalEarningsNum !== null ? totalEarningsNum >= 0 : true;

  const cards = [
    {
      title: "Total Earnings",
      value: totalEarningsNum !== null ? formatCurrency(totalEarningsNum) : "--",
      icon: isProfit ? TrendingUp : TrendingDown,
      color: isProfit
        ? "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400"
        : "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
      highlight: true,
      isProfit,
    },
    {
      title: "Win Rate",
      value: metrics.winRate !== undefined ? formatPercentage(metrics.winRate) : "--",
      icon: Percent,
      color: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
    },
    {
      title: "Total Trades",
      value: metrics.totalTrades !== undefined ? metrics.totalTrades : "--",
      icon: Activity,
      color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    },
    {
      title: "Winning Trades",
      value: metrics.winningTrades !== undefined ? metrics.winningTrades : "--",
      icon: Award,
      color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
    },
    {
      title: "Losing Trades",
      value: metrics.losingTrades !== undefined ? metrics.losingTrades : "--",
      icon: Target,
      color: "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400",
    },
    {
      title: "Average Profit",
      value: metrics.averageProfit !== undefined ? formatCurrency(metrics.averageProfit) : "--",
      icon: BarChart2,
      color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400",
    },
    {
      title: "Maximum Drawdown",
      value: metrics.maximumDrawdown !== undefined ? formatPercentage(metrics.maximumDrawdown) : "--",
      icon: ShieldAlert,
      color: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
    },
    {
      title: "Profit Factor",
      value: metrics.profitFactor !== undefined ? Number(metrics.profitFactor).toFixed(2) : "--",
      icon: Target,
      color: "bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400",
    },
  ];

  return (
    <Card className="border border-slate-200 dark:border-slate-800">
      <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Backtest Performance Metrics
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {symbol ? `Historical evaluation for ${symbol}` : "Strategy evaluation metrics"}
              {strategyName ? ` · ${strategyName}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/40"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {card.title}
                  </p>
                  <p
                    className={`mt-1.5 text-xl font-bold ${
                      card.highlight && card.isProfit !== undefined
                        ? card.isProfit
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                        : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {card.value}
                  </p>
                </div>

                <div className={`rounded-lg p-2 ${card.color}`}>
                  <Icon size={16} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
