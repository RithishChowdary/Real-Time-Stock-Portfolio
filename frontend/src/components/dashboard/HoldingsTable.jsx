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

      <div className="overflow-hidden">
        <table className="w-full">
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
                Value
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                P/L
              </th>
            </tr>
          </thead>

          <tbody>
            {holdings.map((item) => {
              const isProfit = Number(item.profitLoss) >= 0;

              return (
                <tr
                  key={item.symbol}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {item.symbol}
                      </p>

                      <p className="text-xs text-slate-500">
                        {item.companyName}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm">
                    {item.quantity}
                  </td>

                  <td className="px-5 py-4 text-sm">
                    {formatCurrency(item.averagePrice)}
                  </td>

                  <td className="px-5 py-4 text-sm">
                    {formatCurrency(item.currentPrice)}
                  </td>

                  <td className="px-5 py-4 text-sm">
                    {formatCurrency(item.investedValue)}
                  </td>

                  <td className="px-5 py-4 font-medium">
                    {formatCurrency(item.currentValue)}
                  </td>

                  <td className="px-5 py-4">
                    <div
                      className={`font-semibold ${
                        isProfit
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(item.profitLoss)}
                    </div>

                    <div
                      className={`text-xs ${
                        isProfit
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatPercentage(
                        item.profitLossPercentage
                      )}
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