import {
  Bell,
  LineChart,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Card from "../ui/Card";
import {
  formatCurrency,
  formatPercentage,
} from "../../utils/formatters";

export default function DashboardCards({ summary }) {
  const navigate = useNavigate();

  const profitLoss = Number(
    summary?.totalProfitLoss || 0
  );

  const isProfit = profitLoss >= 0;

  const cardRoutes = {
    "Total Investment": "/transactions",
    "Current Value": "/transactions",
    "Profit / Loss": "/transactions",
    "Portfolio Return": "/transactions",
    "Stocks Owned": "/stocks",
    "Unread Alerts": "/notifications",
  };

  const cards = [
    {
      title: "Total Investment",
      value: formatCurrency(
        summary?.totalInvestment
      ),
      icon: Wallet,
      iconBg:
        "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
    },
    {
      title: "Current Value",
      value: formatCurrency(
        summary?.currentValue
      ),
      icon: LineChart,
      iconBg:
        "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400",
    },
    {
      title: "Profit / Loss",
      value: formatCurrency(
        summary?.totalProfitLoss
      ),
      icon: isProfit
        ? TrendingUp
        : TrendingDown,
      iconBg: isProfit
        ? "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400"
        : "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
    },
    {
      title: "Portfolio Return",
      value: formatPercentage(
        summary?.profitLossPercentage
      ),
      icon: isProfit
        ? TrendingUp
        : TrendingDown,
      iconBg: isProfit
        ? "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400"
        : "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
    },
    {
      title: "Stocks Owned",
      value: summary?.totalStocks || 0,
      icon: LineChart,
      iconBg:
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    },
    
    {
      title: "Unread Alerts",
      value:
        summary?.unreadNotifications || 0,
      icon: Bell,
      iconBg:
        "bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.title}
            onClick={() =>
              navigate(
                cardRoutes[card.title]
              )
            }
            
            className="group relative cursor-pointer border border-slate-800 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-900/20 dark:border-slate-800"
          >
            
            {/* View Badge */}
            <div className="absolute right-3 bottom-3 rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-medium text-slate-900 shadow-sm opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:text-white">
              View →
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {card.title}
                </p>

                <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                  {card.value}
                </h3>
              </div>

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconBg}`}
              >
                <Icon size={18} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}