import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import { formatCurrency, formatDateTime } from "../../utils/formatters";

export default function TransactionTable({ transactions }) {
  if (!transactions?.length) {
    return (
      <EmptyState
        title="No transactions found"
        message="Buy or sell stocks to see transaction history."
      />
    );
  }

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Transaction History</h2>
        <p className="text-sm text-slate-500">
          Your latest buy and sell records.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
            <tr>
              <th className="py-3">Stock</th>
              <th className="py-3">Type</th>
              <th className="py-3">Quantity</th>
              <th className="py-3">Price</th>
              <th className="py-3">Date</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {transactions.map((tx) => {
              const isBuy = tx.transactionType === "BUY";

              return (
                <tr key={tx.id}>
                  <td className="py-4">
                    <p className="font-semibold">{tx.symbol}</p>
                    <p className="text-xs text-slate-500">{tx.companyName}</p>
                  </td>

                  <td className="py-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        isBuy
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {tx.transactionType}
                    </span>
                  </td>

                  <td className="py-4">{tx.quantity}</td>
                  <td className="py-4">{formatCurrency(tx.price)}</td>
                  <td className="py-4 text-slate-500">
                    {formatDateTime(tx.transactionDate)}
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