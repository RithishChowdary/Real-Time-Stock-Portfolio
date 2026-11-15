import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BarChart2,
  Minus,
  Percent,
  Scale,
  ShieldAlert,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import { formatCurrency, formatPercentage } from "../../utils/formatters";

function finiteNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function money(value, signed = false) {
  const number = finiteNumber(value);
  if (number === null) return "--";
  return signed && number > 0
    ? `+${formatCurrency(number)}`
    : formatCurrency(number);
}

function percentage(value, signed = false) {
  const number = finiteNumber(value);
  if (number === null) return "--";
  return `${signed && number > 0 ? "+" : ""}${formatPercentage(number)}`;
}

function lossMoney(value) {
  const number = finiteNumber(value);
  if (number === null) return "--";
  return number === 0
    ? formatCurrency(0)
    : `-${formatCurrency(Math.abs(number))}`;
}

function valueTone(value) {
  const number = finiteNumber(value);
  if (number === null || number === 0) return "text-slate-900 dark:text-[#F1F3F5]";
  return number > 0 ? "text-[#00C896]" : "text-[#FF4D5A]";
}

export default function BacktestSummary({
  results,
  symbol,
  strategyName,
  initialCapital: configuredCapital,
}) {
  if (!results) {
    return (
      <Card className="border border-slate-200 bg-white dark:border-[#2A2E32] dark:bg-[#181B1D]">
        <EmptyState
          title="No backtest results yet"
          message="Select an Indian stock and run a quantitative strategy backtest to view execution metrics."
        />
      </Card>
    );
  }

  const metrics = results.performanceMetrics || results;
  const initialCapital =
    finiteNumber(metrics.initialCapital) ?? finiteNumber(configuredCapital);
  const earningsFromApi = finiteNumber(metrics.totalEarnings);
  const finalFromApi = finiteNumber(metrics.finalPortfolioValue);
  const totalEarnings =
    earningsFromApi ??
    (initialCapital !== null && finalFromApi !== null
      ? finalFromApi - initialCapital
      : null);
  const finalPortfolioValue =
    finalFromApi ??
    (initialCapital !== null && totalEarnings !== null
      ? initialCapital + totalEarnings
      : null);
  const roi =
    finiteNumber(metrics.returnOnInvestment ?? metrics.roi) ??
    (initialCapital !== null && initialCapital > 0 && totalEarnings !== null
      ? (totalEarnings / initialCapital) * 100
      : null);
  const profitFactor = finiteNumber(metrics.profitFactor);
  const profitFactorUnavailable =
    metrics.profitFactorDefined === false || profitFactor === null;

  const capitalCards = [
    {
      title: "Initial Capital",
      value: money(initialCapital),
      icon: Wallet,
      color: "bg-slate-100 text-slate-700 dark:bg-[#141719] dark:text-[#9AA1A9]",
      valueColor: "text-slate-900 dark:text-[#F1F3F5]",
      subtitle: "Starting backtest balance",
    },
    {
      title: "Final Portfolio Value",
      value: money(finalPortfolioValue),
      icon: Scale,
      color: "bg-slate-100 text-slate-700 dark:bg-[#141719] dark:text-[#9AA1A9]",
      valueColor: valueTone(totalEarnings),
      subtitle: "Includes open holdings at final close",
    },
    {
      title: "Total Earnings",
      value: money(totalEarnings, true),
      icon:
        totalEarnings === null || totalEarnings === 0
          ? Minus
          : totalEarnings > 0
            ? TrendingUp
            : TrendingDown,
      color:
        totalEarnings === null || totalEarnings === 0
          ? "bg-slate-100 text-slate-700 dark:bg-[#141719] dark:text-[#9AA1A9]"
          : totalEarnings > 0
            ? "bg-[#00C896]/10 text-[#00C896]"
            : "bg-[#FF4D5A]/10 text-[#FF4D5A]",
      valueColor: valueTone(totalEarnings),
      subtitle: "Account-level profit / loss",
    },
    {
      title: "Return on Investment",
      value: percentage(roi, true),
      icon: roi === null || roi === 0 ? Percent : roi > 0 ? ArrowUpRight : ArrowDownRight,
      color:
        roi === null || roi === 0
          ? "bg-slate-100 text-slate-700 dark:bg-[#141719] dark:text-[#9AA1A9]"
          : roi > 0
            ? "bg-[#00C896]/10 text-[#00C896]"
            : "bg-[#FF4D5A]/10 text-[#FF4D5A]",
      valueColor: valueTone(roi),
      subtitle: "Return relative to initial capital",
    },
  ];

  const quantitativeCards = [
    { title: "Total Trades", value: metrics.totalTrades, icon: Activity },
    { title: "Winning Trades", value: metrics.winningTrades, icon: Award, positive: true },
    { title: "Losing Trades", value: metrics.losingTrades, icon: Target, negative: true },
    {
      title: "Win Rate",
      value: percentage(metrics.winRate),
      icon: Percent,
    },
    {
      title: "Average Winning Trade",
      value: money(metrics.averageWinningTrade, true),
      icon: TrendingUp,
      positive: true,
    },
    {
      title: "Average Losing Trade",
      value: lossMoney(metrics.averageLosingTrade),
      icon: TrendingDown,
      negative: true,
    },
    {
      title: "Expectancy / Trade",
      value: money(metrics.expectancy, true),
      icon: BarChart2,
      tone: metrics.expectancy,
    },
    {
      title: "Average Trade P&L",
      value: money(metrics.averageProfit, true),
      icon: BarChart2,
      tone: metrics.averageProfit,
    },
    {
      title: "Risk / Reward Ratio",
      value:
        finiteNumber(metrics.riskRewardRatio) === null
          ? "N/A"
          : `${finiteNumber(metrics.riskRewardRatio).toFixed(2)}:1`,
      icon: Target,
    },
    {
      title: "Profit Factor",
      value: profitFactorUnavailable ? "N/A" : profitFactor.toFixed(2),
      icon: Zap,
    },
    {
      title: "Maximum Drawdown",
      value: percentage(metrics.maximumDrawdown),
      icon: ShieldAlert,
    },
    {
      title: "Sharpe Ratio",
      value:
        finiteNumber(metrics.sharpeRatio) === null
          ? "N/A"
          : finiteNumber(metrics.sharpeRatio).toFixed(2),
      icon: Scale,
    },
  ];

  return (
    <Card className="border border-slate-200 bg-white dark:border-[#2A2E32] dark:bg-[#181B1D]">
      <div className="border-b border-slate-200 pb-3 dark:border-[#2A2E32]">
        <h2 className="text-base font-bold text-slate-900 dark:text-[#F1F3F5]">
          Backtest Performance Metrics
        </h2>
        <p className="text-xs text-slate-500 dark:text-[#9AA1A9]">
          {symbol ? `Historical evaluation for ${symbol}` : "Strategy evaluation metrics"}
          {strategyName ? ` · ${strategyName}` : ""}
        </p>
      </div>

      <section className="mt-4">
        <div className="mb-2.5 flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#9AA1A9]">
            Capital &amp; Return Summary
          </span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-[#2A2E32]" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {capitalCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-[#2A2E32] dark:bg-[#141719]"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9AA1A9]">
                      {card.title}
                    </p>
                    <p className={`mt-1.5 truncate font-mono text-lg font-bold sm:text-xl ${card.valueColor}`}>
                      {card.value}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400 dark:text-[#6F7780]">
                      {card.subtitle}
                    </p>
                  </div>
                  <div className={`ml-2 shrink-0 rounded-xl p-2 ${card.color}`}>
                    <Icon size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-5">
        <div className="mb-2.5 flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#9AA1A9]">
            Trade &amp; Risk Metrics
          </span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-[#2A2E32]" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {quantitativeCards.map((card) => {
            const Icon = card.icon;
            const dynamicTone =
              card.tone !== undefined ? valueTone(card.tone) : null;
            const valueColor = dynamicTone
              || (card.positive
                ? "text-[#00C896]"
                : card.negative
                  ? "text-[#FF4D5A]"
                  : "text-slate-900 dark:text-[#F1F3F5]");
            const isUnavailableMarker =
              card.value === "--" || card.value === "N/A";
            const parsedValue = finiteNumber(card.value);
            const displayValue = isUnavailableMarker
              ? card.value
              : parsedValue === null
                ? "--"
                : parsedValue;

            return (
              <div
                key={card.title}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-[#2A2E32] dark:bg-[#141719]"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9AA1A9]">
                      {card.title}
                    </p>
                    <p className={`mt-1.5 truncate font-mono text-base font-bold sm:text-lg ${valueColor}`}>
                      {displayValue}
                    </p>
                  </div>
                  <div className="ml-2 shrink-0 rounded-xl bg-slate-100 p-2 text-slate-700 dark:bg-[#181B1D] dark:text-[#9AA1A9]">
                    <Icon size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </Card>
  );
}
