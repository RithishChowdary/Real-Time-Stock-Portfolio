import Card from "../ui/Card";
import { formatCurrency, formatPercentage } from "../../utils/formatters";

export default function StrategyComparison({ comparisonData }) {
  // Available strategies in system
  const strategies = [
    { id: "EMA_RSI", label: "EMA + RSI" },
    { id: "EMA_CROSSOVER", label: "EMA Crossover" },
  ];

  const metricsList = [
    { key: "totalEarnings", label: "Total Earnings", format: (v) => (v !== undefined ? formatCurrency(v) : "--") },
    { key: "winRate", label: "Win Rate", format: (v) => (v !== undefined ? formatPercentage(v) : "--") },
    { key: "totalTrades", label: "Total Trades", format: (v) => (v !== undefined ? v : "--") },
    { key: "maximumDrawdown", label: "Max Drawdown", format: (v) => (v !== undefined ? formatPercentage(v) : "--") },
    { key: "profitFactor", label: "Profit Factor", format: (v) => (v !== undefined ? Number(v).toFixed(2) : "--") },
  ];

  return (
    <Card className="border border-slate-200 dark:border-slate-800">
      <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Strategy Comparison
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Side-by-side performance benchmarks for quantitative strategies on the selected asset.
        </p>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[500px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
              <th className="py-2.5 font-semibold uppercase tracking-wider">Benchmark Metric</th>
              {strategies.map((strat) => (
                <th key={strat.id} className="py-2.5 font-semibold uppercase tracking-wider">
                  {strat.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {metricsList.map((metric) => (
              <tr key={metric.key} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                <td className="py-3 font-medium text-slate-700 dark:text-slate-300">
                  {metric.label}
                </td>
                {strategies.map((strat) => {
                  const stratMetrics = comparisonData?.[strat.id];
                  const rawValue = stratMetrics?.[metric.key];
                  const formattedValue = stratMetrics ? metric.format(rawValue) : "--";

                  return (
                    <td key={strat.id} className="py-3 font-semibold text-slate-900 dark:text-slate-100">
                      {formattedValue}
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
