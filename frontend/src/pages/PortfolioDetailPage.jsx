import { ArrowLeft, Briefcase, Banknote, Wallet, PieChart, TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Loader from "../components/ui/Loader";
import HoldingsTable from "../components/dashboard/HoldingsTable";
import TransactionTable from "../components/transactions/TransactionTable";
import { getPortfolioById } from "../services/portfolioService";
import { getAccount } from "../services/accountService";
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
  const [account, setAccount] = useState(null);
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
        accountData,
      ] = await Promise.all([
        getPortfolioById(id),
        getPortfolioSummary(id),
        getPortfolioHoldings(id),
        getPortfolioTransactions(id, 0, 10),
        getAccount().catch(() => null),
      ]);

      setPortfolio(portfolioData);
      setSummary(summaryData);
      setHoldings(holdingsData || []);
      setTransactions(transactionsData?.content || []);
      setAccount(accountData);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load portfolio details"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPortfolio();
  }, [id]);

  if (loading) return <Loader />;

  if (error || !portfolio) {
    return (
      <div className="space-y-4">
        <Link
          to="/portfolios"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={16} /> Back to Portfolios
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          <h2 className="font-semibold">Portfolio Error</h2>
          <p className="mt-1 text-sm">{error || "Portfolio not found"}</p>
        </div>
      </div>
    );
  }

  const availableCash = Number(account?.availableCash ?? summary?.availableCash ?? 0);
  const holdingsValue = Number(summary?.currentValue ?? 0);
  const totalPortfolioValue = availableCash + holdingsValue;
  const investedValue = Number(summary?.totalInvestment ?? 0);
  const profitLoss = Number(summary?.totalProfitLoss ?? 0);
  const returnPct = Number(summary?.returnPercentage ?? 0);
  const isProfit = profitLoss >= 0;

  const statCards = [
    {
      title: "Total Portfolio Value",
      value: formatCurrency(totalPortfolioValue),
      subtitle: "Cash + Holdings",
      icon: PieChart,
      iconBg: "bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400",
    },
    {
      title: "Available Cash",
      value: formatCurrency(availableCash),
      subtitle: "Virtual Capital",
      icon: Banknote,
      iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
    },
    {
      title: "Invested in Stocks",
      value: formatCurrency(investedValue),
      subtitle: `${holdings.length} positions`,
      icon: Wallet,
      iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
    },
    {
      title: "Current Holdings Value",
      value: formatCurrency(holdingsValue),
      subtitle: "Market Value",
      icon: Wallet,
      iconBg: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400",
    },
    {
      title: "Total Profit / Loss",
      value: (isProfit && profitLoss > 0 ? `+` : ``) + formatCurrency(profitLoss),
      subtitle: formatPercentage(returnPct),
      isProfit,
      icon: isProfit ? TrendingUp : TrendingDown,
      iconBg: isProfit
        ? "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400"
        : "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back Link & Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            to="/portfolios"
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            <ArrowLeft size={14} /> Back to Portfolios
          </Link>
          <div className="border-b border-slate-200 dark:border-slate-800 pb-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {portfolio.portfolioName}
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Created on {formatDateTime(portfolio.createdAt)}
            {portfolio.user && ` · Owner: ${portfolio.user.name}`}
          </p>
        </div>

        <Link
          to="/transactions"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          Trade Stocks →
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {card.title}
                  </p>
                  <h3 className={`mt-1.5 text-xl font-bold ${
                    card.isProfit !== undefined
                      ? card.isProfit
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                      : "text-slate-900 dark:text-white"
                  }`}>
                    {card.value}
                  </h3>
                  {card.subtitle && (
                    <p
                      className={`mt-1 text-xs font-medium ${
                        card.isProfit !== undefined
                          ? card.isProfit
                            ? "text-green-600 dark:text-green-400 font-bold"
                            : "text-red-600 dark:text-red-400 font-bold"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {card.subtitle}
                    </p>
                  )}
                </div>

                <div className={`rounded-xl p-2.5 ${card.iconBg}`}>
                  <Icon size={18} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Holdings Table */}
      <HoldingsTable holdings={holdings} />

      {/* Transactions History */}
      <TransactionTable transactions={transactions} />
    </div>
  );
}