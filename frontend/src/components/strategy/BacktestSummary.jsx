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
      <Card className="border border-slate-200 dark:border-[#2A2E32] bg-white dark:bg-[#181B1D]">
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
      value: totalEarningsNum !== null ? (isProfit && totalEarningsNum > 0 ? "+" : "") + formatCurrency(totalEarningsNum) : "--",
      icon: isProfit ? TrendingUp : TrendingDown,
      color: isProfit
        ? "bg-[#00C896]/10 text-[#00C896] border border-[#00C896]/20"
        : "bg-[#FF4D5A]/10 text-[#FF4D5A] border border-[#FF4D5A]/20",
      highlight: true,
      isProfit,
    },
    {
      title: "Win Rate",
      value: metrics.winRate !== undefined ? formatPercentage(metrics.winRate) : "--",
      icon: Percent,
      color: "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20",
    },
    {
      title: "Total Trades",
      value: metrics.totalTrades !== undefined ? metrics.totalTrades : "--",
      icon: Activity,
      color: "bg-slate-100 dark:bg-[#141719] text-slate-700 dark:text-[#9AA1A9] border border-slate-200 dark:border-[#2A2E32]",
    },
    {
      title: "Winning Trades",
      value: metrics.winningTrades !== undefined ? metrics.winningTrades : "--",
      icon: Award,
      color: "bg-[#00C896]/10 text-[#00C896] border border-[#00C896]/20",
    },
    {
      title: "Losing Trades",
      value: metrics.losingTrades !== undefined ? metrics.losingTrades : "--",
      icon: Target,
      color: "bg-[#FF4D5A]/10 text-[#FF4D5A] border border-[#FF4D5A]/20",
    },
    {
      title: "Average Profit",
      value: metrics.averageProfit !== undefined ? formatCurrency(metrics.averageProfit) : "--",
      icon: BarChart2,
      color: "bg-slate-100 dark:bg-[#141719] text-slate-700 dark:text-[#9AA1A9] border border-slate-200 dark:border-[#2A2E32]",
    },
    {
      title: "Maximum Drawdown",
      value: metrics.maximumDrawdown !== undefined ? formatPercentage(metrics.maximumDrawdown) : "--",
      icon: ShieldAlert,
      color: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    },
    {
      title: "Profit Factor",
      value: metrics.profitFactor !== undefined ? Number(metrics.profitFactor).toFixed(2) : "--",
      icon: Target,
      color: "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20",
    },
  ];

  return (
    <Card className="border border-slate-200 dark:border-[#2A2E32] bg-white dark:bg-[#181B1D]">
      <div className="border-b border-slate-200 pb-3 dark:border-[#2A2E32]">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-[#F1F3F5]">
              Backtest Performance Metrics
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#9AA1A9]">
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
              className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-[#2A2E32] dark:bg-[#141719]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9AA1A9]">
                    {card.title}
                  </p>
                  <p
                    className={`mt-1.5 text-xl font-bold font-mono ${
                      card.highlight && card.isProfit !== undefined
                        ? card.isProfit
                          ? "text-[#00C896]"
                          : "text-[#FF4D5A]"
                        : "text-slate-900 dark:text-[#F1F3F5]"
                    }`}
                  >
                    {card.value}
                  </p>
                </div>

                <div className={`rounded-xl p-2 ${card.color}`}>
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
