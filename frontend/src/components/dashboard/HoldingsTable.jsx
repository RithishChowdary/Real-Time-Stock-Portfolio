import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import {
  formatCurrency,
  formatPercentage,
} from "../../utils/formatters";

export default function HoldingsTable({ holdings }) {
  if (!holdings?.length) {
    return (
      <EmptyState
        title="No holdings yet"
        message="Buy your first stock to start building your portfolio."
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 dark:border-slate-800 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Holdings
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Active positions in your portfolio
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Stock
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Qty
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Avg Price
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Current
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Invested
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Current Value
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                P/L (Return)
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {holdings.map((item) => {
              const plNum = Number(item.profitLoss || 0);
              const isProfit = plNum >= 0;
              const plPct = Number(item.profitLossPercentage || 0);

              return (
                <tr
                  key={item.symbol}
                  className="transition hover:bg-slate-50 dark:hover:bg-slate-900/50"
                >
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {item.symbol}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.companyName}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                    {item.quantity}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {formatCurrency(item.averagePrice)}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {formatCurrency(item.currentPrice)}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {formatCurrency(item.investedValue)}
                  </td>

                  <td className="px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(item.currentValue)}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div
                      className={`font-bold ${
                        isProfit
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {isProfit && plNum > 0 ? `+${formatCurrency(plNum)}` : formatCurrency(plNum)}
                    </div>

                    <div
                      className={`text-xs font-semibold ${
                        isProfit
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {isProfit && plPct > 0 ? `+${formatPercentage(plPct)}` : formatPercentage(plPct)}
                    </div>
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