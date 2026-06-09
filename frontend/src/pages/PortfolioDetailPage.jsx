import { ArrowLeft, Briefcase } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Loader from "../components/ui/Loader";
import { getPortfolioById } from "../services/portfolioService";

import {
  getPortfolioSummary,
  getPortfolioHoldings,
  getPortfolioTransactions,
} from "../services/transactionService";

import {
  formatCurrency,
  formatDateTime,
  formatPercentage,
} from "../utils/formatters";

export default function PortfolioDetailPage() {
  const { id } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [summary, setSummary] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

 async function loadPortfolio() {
  setLoading(true);
  setError("");

  try {
    const [
      portfolioData,
      summaryData,
      holdingsData,
      transactionsData,
    ] = await Promise.all([
      getPortfolioById(id),
      getPortfolioSummary(id),
      getPortfolioHoldings(id),
      getPortfolioTransactions(id, 0, 5),
    ]);

    setPortfolio(portfolioData);
    setSummary(summaryData);
    setHoldings(holdingsData);
    setTransactions(transactionsData?.content || []);
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Unable to load portfolio"
    );
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    loadPortfolio();
  }, [id]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
        <h2 className="font-semibold">Portfolio error</h2>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/portfolios"
        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700"
      >
        <ArrowLeft size={16} />
        Back to portfolios
      </Link>

      <Card>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <Briefcase size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold">{portfolio.portfolioName}</h1>
            <p className="mt-1 text-sm text-slate-500">
              Created: {formatDateTime(portfolio.createdAt)}
            </p>

            {portfolio.user && (
              <p className="mt-2 text-sm text-slate-600">
                Owner: {portfolio.user.name} · {portfolio.user.email}
              </p>
            )}
          </div>
        </div>
      </Card>

<div className="grid gap-4 md:grid-cols-4">
  <Card>
    <p className="text-sm text-slate-500">
      Total Holdings
    </p>

    <h3 className="mt-2 text-2xl font-bold">
      {holdings.length}
    </h3>
  </Card>

  <Card>
    <p className="text-sm text-slate-500">
      Invested Value
    </p>

    <h3 className="mt-2 text-2xl font-bold">
      {formatCurrency(
        summary?.totalInvestment || 0
      )}
    </h3>
  </Card>

  <Card>
    <p className="text-sm text-slate-500">
      Current Value
    </p>

    <h3 className="mt-2 text-2xl font-bold">
      {formatCurrency(
        summary?.currentValue || 0
      )}
    </h3>
  </Card>

  <Card>
    <p className="text-sm text-slate-500">
      Profit / Loss
    </p>

    <h3
      className={`mt-2 text-2xl font-bold ${
        Number(
          summary?.totalProfitLoss || 0
        ) >= 0
          ? "text-green-600"
          : "text-red-600"
      }`}
    >
      {formatCurrency(
        summary?.totalProfitLoss || 0
      )}
    </h3>

    <p className="mt-1 text-xs text-slate-500">
      {formatPercentage(
        summary?.returnPercentage || 0
      )}
    </p>
  </Card>
</div>

<Card>
  <h2 className="text-lg font-semibold">
    Portfolio Overview
  </h2>

  <div className="mt-4 grid gap-4 md:grid-cols-2">
    <div>
      <p className="text-sm text-slate-500">
        Holdings Count
      </p>

      <p className="mt-1 font-semibold">
        {holdings.length}
      </p>
    </div>

    <div>
      <p className="text-sm text-slate-500">
        Portfolio Return
      </p>

      <p
        className={`mt-1 font-semibold ${
          Number(
            summary?.totalProfitLoss || 0
          ) >= 0
            ? "text-green-600"
            : "text-red-600"
        }`}
      >
        {formatPercentage(
          summary?.returnPercentage || 0
        )}
      </p>
    </div>
  </div>
</Card>
        <Card>
  <h2 className="mb-4 text-lg font-semibold">
    Holdings
  </h2>

  {!holdings.length ? (
    <p className="text-sm text-slate-500">
      No holdings found in this portfolio.
    </p>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800">
            <th className="pb-3">Stock</th>
            <th className="pb-3">Quantity</th>
            <th className="pb-3">Avg Price</th>
            <th className="pb-3">Current Price</th>
            <th className="pb-3">Profit/Loss</th>
          </tr>
        </thead>

        <tbody>
          {holdings.map((holding) => {
            const isProfit =
              Number(holding.profitLoss) >= 0;

            return (
              <tr
                key={holding.symbol}
                className="border-b border-slate-100 dark:border-slate-800"
              >
                <td className="py-4">
                  <div>
                    <p className="font-semibold">
                      {holding.symbol}
                    </p>

                    <p className="text-xs text-slate-500">
                      {holding.companyName}
                    </p>
                  </div>
                </td>

                <td className="py-4">
                  {holding.quantity}
                </td>

                <td className="py-4">
                  {formatCurrency(
                    holding.averagePrice
                  )}
                </td>

                <td className="py-4">
                  {formatCurrency(
                    holding.currentPrice
                  )}
                </td>

                <td
                  className={`py-4 font-semibold ${
                    isProfit
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(
                    holding.profitLoss
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )}
</Card>

<Card>
  <h2 className="mb-4 text-lg font-semibold">
    Recent Transactions
  </h2>

  {!transactions.length ? (
    <p className="text-sm text-slate-500">
      No transactions yet.
    </p>
  ) : (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800"
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                transaction.transactionType === "BUY"
                  ? "bg-green-500/20 text-green-500"
                  : "bg-red-500/20 text-red-500"
              }`}
            >
              {transaction.transactionType === "BUY" ? "B" : "S"}
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {transaction.transactionType} {transaction.symbol}
              </p>
              <p className="text-xs text-slate-500">
                {formatDateTime(transaction.transactionDate)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-slate-900 dark:text-white">
              {transaction.quantity} @ {formatCurrency(transaction.price)}
            </p>
            <p className="text-xs text-slate-500">
              {formatCurrency(transaction.totalAmount)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )}
</Card>

    </div>
  );
}