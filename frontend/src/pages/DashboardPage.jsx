import { useEffect, useState } from "react";
import DashboardCards from "../components/dashboard/DashboardCards";
import QuickActions from "../components/dashboard/QuickActions";
import HoldingsTable from "../components/dashboard/HoldingsTable";
import NotificationsPanel from "../components/dashboard/NotificationsPanel";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import NiftyChart from "../components/dashboard/NiftyChart";
import MarketTicker from "../components/dashboard/MarketTicker";
import TopMovers from "../components/dashboard/TopMovers";
import LiveStockTicker from "../components/dashboard/LiveStockTicker";
import Loader from "../components/ui/Loader";

import {
  getDashboardHoldings,
  getDashboardNotifications,
  getDashboardSummary,
  getRecentTransactions,
} from "../services/dashboardService";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [summaryData, holdingsData, transactionsData, notificationsData] =
        await Promise.all([
          getDashboardSummary(),
          getDashboardHoldings(),
          getRecentTransactions(),
          getDashboardNotifications(),
        ]);

      setSummary(summaryData);
      setHoldings(holdingsData);
      setRecentTransactions(transactionsData);
      setNotifications(notificationsData);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <h2 className="font-semibold text-red-700">
          Dashboard Error
        </h2>

        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>

        <button
          onClick={loadDashboard}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Market Ticker */}
      <MarketTicker />

      {/* Header */}
      <div>
   <div className="border-b border-slate-200 dark:border-slate-800 pb-1.5 inline-block w-full">
  <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-blue-500">
    Portfolio Analytics
  </p>
  <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
    Dashboard
  </h1>
</div>




        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Monitor investments, holdings, transactions and alerts.
        </p>
      </div>

      {/* Summary Cards */}
        <DashboardCards summary={summary} />

        {/* Quick Actions */}
        <QuickActions />

        {/* NIFTY 50 Market Chart */}
        <NiftyChart />

        {/* Holdings - Full Width */}
      <HoldingsTable holdings={holdings} />

      {/* Recent Transactions + Activity */}
      <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <RecentTransactions transactions={recentTransactions} />

        <div className="space-y-5">
          <LiveStockTicker />
          <TopMovers />
          <NotificationsPanel notifications={notifications} />
        </div>
      </div>
    </div>
  );
}