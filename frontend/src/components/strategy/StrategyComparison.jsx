import Card from "../ui/Card";
import { formatCurrency, formatPercentage } from "../../utils/formatters";

function finiteNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function signedCurrency(value) {
  const number = finiteNumber(value);
  if (number === null) return "--";
  return `${number > 0 ? "+" : ""}${formatCurrency(number)}`;
}

function signedPercentage(value) {
  const number = finiteNumber(value);
  if (number === null) return "--";
  return `${number > 0 ? "+" : ""}${formatPercentage(number)}`;
}

export default function StrategyComparison({ comparisonData }) {
  const strategies = [
    { id: "EMA_RSI", label: "EMA + RSI" },
    { id: "EMA_CROSSOVER", label: "EMA Crossover" },
  ];

  const metricsList = [
    {
      key: "returnOnInvestment",
      label: "Return on Investment (ROI)",
      format: (value) => signedPercentage(value),
      tone: (value) => value,
    },
    {
      key: "totalEarnings",
      label: "Total Earnings",
      format: (value) => signedCurrency(value),
      tone: (value) => value,
    },
    {
      key: "winRate",
      label: "Win Rate",
      format: (value) => {
        const number = finiteNumber(value);
        return number === null ? "--" : formatPercentage(number);
      },
    },
    {
      key: "profitFactor",
      label: "Profit Factor",
      format: (value, metrics) => {
        if (metrics.profitFactorDefined === false) return "N/A";
        const number = finiteNumber(value);
        return number === null ? "N/A" : number.toFixed(2);
      },
    },
    {
      key: "maximumDrawdown",
      label: "Maximum Drawdown",
      format: (value) => {
        const number = finiteNumber(value);
        return number === null ? "--" : formatPercentage(number);
      },
    },
    {
      key: "sharpeRatio",
      label: "Sharpe Ratio",
      format: (value) => {
        const number = finiteNumber(value);
        return number === null ? "N/A" : number.toFixed(2);
      },
    },
    {
      key: "totalTrades",
      label: "Total Trades",
      format: (value) => {
        const number = finiteNumber(value);
        return number === null ? "--" : number;
      },
    },
  ];

  return (
    <Card className="border border-slate-200 bg-white dark:border-[#2A2E32] dark:bg-[#181B1D]">
      <div className="border-b border-slate-200 pb-3 dark:border-[#2A2E32]">
        <h2 className="text-base font-bold text-slate-900 dark:text-[#F1F3F5]">
          Strategy Comparison
        </h2>
        <p className="text-xs text-slate-500 dark:text-[#9AA1A9]">
          Side-by-side performance benchmarks using the configured initial capital.
        </p>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[500px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 dark:border-[#2A2E32] dark:text-[#9AA1A9]">
              <th className="py-2.5 font-semibold uppercase tracking-wider">
                Benchmark Metric
              </th>
              {strategies.map((strategy) => (
                <th
                  key={strategy.id}
                  className="py-2.5 font-semibold uppercase tracking-wider"
                >
                  {strategy.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#2A2E32]">
            {metricsList.map((metric) => (
              <tr
                key={metric.key}
                className="hover:bg-slate-50 dark:hover:bg-[#1D2023]"
              >
                <td className="py-3 font-medium text-slate-700 dark:text-[#9AA1A9]">
                  {metric.label}
                </td>
                {strategies.map((strategy) => {
                  const metrics = comparisonData?.[strategy.id];
                  const value = metric.key === "returnOnInvestment"
                    ? metrics?.returnOnInvestment ?? metrics?.roi
                    : metrics?.[metric.key];
                  const number = finiteNumber(value);
                  const toneValue = metric.tone ? metric.tone(number) : null;
                  const tone = finiteNumber(toneValue);
                  const colorClass =
                    tone === null || tone === 0
                      ? "text-slate-900 dark:text-[#F1F3F5]"
                      : tone > 0
                        ? "text-[#00C896]"
                        : "text-[#FF4D5A]";

                  return (
                    <td
                      key={strategy.id}
                      className={`py-3 font-mono font-semibold ${colorClass}`}
                    >
                      {metrics ? metric.format(value, metrics) : "--"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
