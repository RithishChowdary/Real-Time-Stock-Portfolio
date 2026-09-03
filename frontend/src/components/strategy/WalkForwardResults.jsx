import { Layers } from "lucide-react";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import { formatCurrency } from "../../utils/formatters";

export default function WalkForwardResults({ walkForwardData }) {
  if (!walkForwardData || !walkForwardData.results || walkForwardData.results.length === 0) {
    return (
      <Card className="border border-slate-200 dark:border-[#2A2E32] bg-white dark:bg-[#181B1D]">
        <div className="border-b border-slate-200 pb-3 dark:border-[#2A2E32]">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-[#3B82F6]" />
            <h2 className="text-base font-bold text-slate-900 dark:text-[#F1F3F5]">
              Walk-Forward Analysis
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#9AA1A9]">
            Out-of-sample evaluation across rolling training and testing windows.
          </p>
        </div>

        <div className="py-6">
          <EmptyState
            title="No walk-forward analysis yet"
            message="Run a walk-forward test to evaluate quantitative strategies against unseen out-of-sample market regimes."
          />
        </div>
      </Card>
    );
  }

  const { symbol, windowsEvaluated, totalOutOfSampleProfit, results } = walkForwardData;
  const isProfit = Number(totalOutOfSampleProfit || 0) >= 0;

  return (
    <Card className="border border-slate-200 dark:border-[#2A2E32] bg-white dark:bg-[#181B1D]">
      <div className="border-b border-slate-200 pb-3 dark:border-[#2A2E32]">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-[#3B82F6]" />
              <h2 className="text-base font-bold text-slate-900 dark:text-[#F1F3F5]">
                Walk-Forward Optimization Results
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#9AA1A9]">
              Out-of-sample performance for {symbol} across {windowsEvaluated} rolling evaluation windows.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-[#9AA1A9]">Total OOS Profit:</span>
            <span
              className={`font-bold font-mono ${
                isProfit ? "text-[#00C896]" : "text-[#FF4D5A]"
              }`}
            >
              {isProfit && Number(totalOutOfSampleProfit) > 0 ? "+" : ""}{formatCurrency(totalOutOfSampleProfit)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#2A2E32] text-slate-500 dark:text-[#9AA1A9]">
              <th className="py-2.5 font-semibold uppercase tracking-wider">Window</th>
              <th className="py-2.5 font-semibold uppercase tracking-wider">Training Bars</th>
              <th className="py-2.5 font-semibold uppercase tracking-wider">Testing Bars</th>
              <th className="py-2.5 font-semibold uppercase tracking-wider">Optimized Parameters</th>
              <th className="py-2.5 font-semibold uppercase tracking-wider">Trades</th>
              <th className="py-2.5 text-right font-semibold uppercase tracking-wider">Testing Profit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#2A2E32]">
            {results.map((win) => {
              const winProfit = Number(win.testingProfit || 0);
              const isWinProfit = winProfit >= 0;

              return (
                <tr key={win.windowNumber} className="hover:bg-slate-50 dark:hover:bg-[#1D2023]">
                  <td className="py-3 font-bold text-slate-900 dark:text-[#F1F3F5]">
                    Window #{win.windowNumber}
                  </td>
                  <td className="py-3 text-slate-600 dark:text-[#9AA1A9]">
                    {win.trainingStart} → {win.trainingEnd}
                  </td>
                  <td className="py-3 text-slate-600 dark:text-[#9AA1A9]">
                    {win.testingStart} → {win.testingEnd}
                  </td>
                  <td className="py-3 text-slate-800 dark:text-[#F1F3F5]">
                    <span className="font-mono text-[11px] bg-slate-100 dark:bg-[#141719] border border-slate-200 dark:border-[#2A2E32] px-2 py-0.5 rounded-md">
                      EMA({win.fastEmaPeriod}/{win.slowEmaPeriod}) RSI({win.rsiPeriod}) [{win.rsiBuyThreshold}/{win.rsiSellThreshold}]
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-slate-700 dark:text-[#9AA1A9]">
                    {win.completedTrades}
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`font-bold font-mono ${
                        isWinProfit
                          ? "text-[#00C896]"
                          : "text-[#FF4D5A]"
                      }`}
                    >
                      {isWinProfit && winProfit > 0 ? "+" : ""}{formatCurrency(winProfit)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
