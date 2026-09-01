import {
  Bell,
  LineChart,
  TrendingDown,
  TrendingUp,
  Wallet,
  Banknote,
  PieChart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Card from "../ui/Card";
import {
  formatCurrency,
  formatPercentage,
} from "../../utils/formatters";

export default function DashboardCards({ summary }) {
  const navigate = useNavigate();

  const profitLoss = Number(summary?.totalProfitLoss || 0);
  const isProfit = profitLoss >= 0;

  const cardRoutes = {
    "Available Cash": "/transactions",
    "Total Portfolio Value": "/portfolios",
    "Total Investment": "/transactions",
    "Current Holdings": "/transactions",
    "Profit / Loss": "/transactions",
    "Stocks Owned": "/stocks",
  };

  const cards = [
    {
      title: "Available Cash",
      value: formatCurrency(summary?.availableCash),
      subtitle: "Paper trading wallet",
      icon: Banknote,
      iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
    },
    {
      title: "Total Portfolio Value",
      value: formatCurrency(
        summary?.totalPortfolioValue ?? (Number(summary?.availableCash || 0) + Number(summary?.currentValue || 0))
      ),
      subtitle: "Cash + Holdings Value",
      icon: PieChart,
      iconBg: "bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400",
    },
    {
      title: "Total Investment",
      value: formatCurrency(summary?.totalInvestment),
      subtitle: "Invested in stocks",
      icon: Wallet,
      iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
    },
    {
      title: "Current Holdings",
      value: formatCurrency(summary?.currentValue),
      subtitle: "Market value of stocks",
      icon: LineChart,
      iconBg: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400",
    },
    {
      title: "Profit / Loss",
      value: formatCurrency(summary?.totalProfitLoss),
      subtitle: formatPercentage(summary?.profitLossPercentage),
      isProfit,
      icon: isProfit ? TrendingUp : TrendingDown,
      iconBg: isProfit
        ? "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400"
        : "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
    },
    {
      title: "Stocks Owned",
      value: summary?.totalStocks || 0,
      subtitle: `${summary?.unreadNotifications || 0} unread alerts`,
      icon: LineChart,
      iconBg: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.title}
            onClick={() => navigate(cardRoutes[card.title] || "/transactions")}
            className="group relative cursor-pointer border border-slate-200 transition-all duration-200 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-lg dark:border-slate-800"
          >
            {/* Hover Indicator */}
            <div className="absolute right-3 bottom-3 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-slate-800 dark:text-slate-300">
              View →
            </div>

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {card.title}
                </p>
                <h3 className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-white">
                  {card.value}
                </h3>
                {card.subtitle && (
                  <p
                    className={`mt-1 text-xs font-medium ${
                      card.isProfit !== undefined
                        ? card.isProfit
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {card.subtitle}
                  </p>
                )}
              </div>

              <div className={`rounded-xl p-2.5 ${card.iconBg}`}>
                <Icon size={20} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}