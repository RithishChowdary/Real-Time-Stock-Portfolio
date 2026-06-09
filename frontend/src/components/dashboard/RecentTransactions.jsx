import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import {
  formatCurrency,
  formatDateTime,
} from "../../utils/formatters";

export default function RecentTransactions({ transactions }) {
  if (!transactions?.length) {
    return (
      <EmptyState
        title="No transactions"
        message="Your latest buy and sell activity will appear here."
      />
    );
  }

  return (
    <Card>
      <div className="mb-4 border-b border-slate-200 pb-3 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Recent Transactions
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Latest portfolio activity
        </p>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {transactions.map((tx, index) => {
          const isBuy = tx.transactionType === "BUY";

          return (
            <div
              key={`${tx.symbol}-${tx.transactionDate}-${index}`}
              className="flex items-center justify-between py-3"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      isBuy
                        ? "bg-green-500/20 text-green-500"
                        : "bg-red-500/20 text-red-500"
                    }`}
                  >
                    {isBuy ? "B" : "S"}
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {tx.symbol}
                    </p>

                    <p className="text-xs text-slate-500">
                      {formatDateTime(tx.transactionDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-slate-500">{tx.quantity} shares</p>

                <p className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(tx.totalAmount)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}