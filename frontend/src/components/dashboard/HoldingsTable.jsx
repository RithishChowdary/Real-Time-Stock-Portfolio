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
    <Card className="overflow-hidden p-0">
      <div className="border-b border-slate-200 dark:border-[#2A2E32] px-6 py-4 dark:bg-[#181B1D]">
        <h2 className="text-base font-semibold text-slate-900 dark:text-[#F1F3F5]">
          Active Portfolio Holdings
        </h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-[#9AA1A9]">
          Real-time position valuations and performance
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-[#2A2E32] dark:bg-[#141719]">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9AA1A9]">
                Stock
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9AA1A9]">
                Qty
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9AA1A9]">
                Avg Buy Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9AA1A9]">
                Current Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9AA1A9]">
                Invested Cost
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9AA1A9]">
                Current Value
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9AA1A9]">
                Unrealized P&L
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-[#2A2E32]">
            {holdings.map((item) => {
              const plNum = Number(item.profitLoss || 0);
              const isProfit = plNum >= 0;
              const plPct = Number(item.profitLossPercentage || 0);

              return (
                <tr
                  key={item.symbol}
                  className="transition hover:bg-slate-50 dark:hover:bg-[#1D2023]"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-[#F1F3F5]">
                        {item.symbol}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-[#6F7780]">
                        {item.companyName}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-sm font-medium text-slate-900 dark:text-[#F1F3F5]">
                    {item.quantity}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-700 dark:text-[#9AA1A9]">
                    {formatCurrency(item.averagePrice)}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-700 dark:text-[#F1F3F5]">
                    {formatCurrency(item.currentPrice)}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-700 dark:text-[#9AA1A9]">
                    {formatCurrency(item.investedValue)}
                  </td>

                  <td className="px-4 py-4 text-sm font-semibold text-slate-900 dark:text-[#F1F3F5]">
                    {formatCurrency(item.currentValue)}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div
                      className={`text-sm font-bold ${
                        isProfit
                          ? "text-[#00C896]"
                          : "text-[#FF4D5A]"
                      }`}
                    >
                      {isProfit && plNum > 0 ? `+${formatCurrency(plNum)}` : formatCurrency(plNum)}
                    </div>

                    <div
                      className={`text-xs font-semibold ${
                        isProfit
                          ? "text-[#00C896]"
                          : "text-[#FF4D5A]"
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