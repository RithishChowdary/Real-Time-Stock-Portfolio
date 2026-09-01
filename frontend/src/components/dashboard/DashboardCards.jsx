import {
  Banknote,
  PieChart,
  Wallet,
  LineChart,
  TrendingDown,
  TrendingUp,
  Layers,
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
      subtitle: "Paper trading balance",
      icon: Banknote,
      iconStyle: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    },
    {
      title: "Total Portfolio Value",
      value: formatCurrency(
        summary?.totalPortfolioValue ??
          Number(summary?.availableCash || 0) + Number(summary?.currentValue || 0)
      ),
      subtitle: "Cash + Holdings Value",
      icon: PieChart,
      iconStyle: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    },
    {
      title: "Total Investment",
      value: formatCurrency(summary?.totalInvestment),
      subtitle: "Total invested capital",
      icon: Wallet,
      iconStyle: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    },
    {
      title: "Current Holdings",
      value: formatCurrency(summary?.currentValue),
      subtitle: "Current market value",
      icon: LineChart,
      iconStyle: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    },
    {
      title: "Profit / Loss",
      value: formatCurrency(summary?.totalProfitLoss),
      subtitle: formatPercentage(summary?.profitLossPercentage),
      isProfit,
      icon: isProfit ? TrendingUp : TrendingDown,
      iconStyle: isProfit
        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        : "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    },
    {
      title: "Stocks Owned",
      value: summary?.totalStocks || 0,
      subtitle: `${summary?.unreadNotifications || 0} active notifications`,
      icon: Layers,
      iconStyle: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
    },
  ];

  return (
    <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.title}
            onClick={() => navigate(cardRoutes[card.title] || "/transactions")}
            className="group relative cursor-pointer border border-slate-800/80 bg-slate-900/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-900/90 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {card.title}
                </p>
                <h3
                  className={`text-2xl font-bold tracking-tight font-mono ${
                    card.isProfit !== undefined
                      ? card.isProfit
                        ? "text-emerald-400"
                        : "text-rose-400"
                      : "text-white"
                  }`}
                >
                  {card.value}
                </h3>
                {card.subtitle && (
                  <p
                    className={`text-xs font-medium ${
                      card.isProfit !== undefined
                        ? card.isProfit
                          ? "text-emerald-400"
                          : "text-rose-400"
                        : "text-slate-500"
                    }`}
                  >
                    {card.subtitle}
                  </p>
                )}
              </div>

              <div className={`rounded-lg p-2.5 shrink-0 ${card.iconStyle}`}>
                <Icon size={18} strokeWidth={2} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}