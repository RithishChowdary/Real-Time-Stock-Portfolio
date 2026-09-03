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
      iconStyle: "bg-[#00C896]/10 text-[#00C896] border border-[#00C896]/20",
    },
    {
      title: "Total Portfolio Value",
      value: formatCurrency(
        summary?.totalPortfolioValue ??
          Number(summary?.availableCash || 0) + Number(summary?.currentValue || 0)
      ),
      subtitle: "Cash + Holdings Value",
      icon: PieChart,
      iconStyle: "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20",
    },
    {
      title: "Total Investment",
      value: formatCurrency(summary?.totalInvestment),
      subtitle: "Invested cost basis",
      icon: Wallet,
      iconStyle: "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20",
    },
    {
      title: "Current Holdings",
      value: formatCurrency(summary?.currentValue),
      subtitle: "Current market value",
      icon: LineChart,
      iconStyle: "bg-slate-100 dark:bg-[#141719] text-slate-700 dark:text-[#9AA1A9] border border-slate-200 dark:border-[#2A2E32]",
    },
    {
      title: "Profit / Loss",
      value: (isProfit && profitLoss > 0 ? "+" : "") + formatCurrency(summary?.totalProfitLoss),
      subtitle: (isProfit ? "+" : "") + formatPercentage(summary?.profitLossPercentage),
      isProfit,
      icon: isProfit ? TrendingUp : TrendingDown,
      iconStyle: isProfit
        ? "bg-[#00C896]/10 text-[#00C896] border border-[#00C896]/20"
        : "bg-[#FF4D5A]/10 text-[#FF4D5A] border border-[#FF4D5A]/20",
    },
    {
      title: "Stocks Owned",
      value: summary?.totalStocks || 0,
      subtitle: `${summary?.unreadNotifications || 0} active notifications`,
      icon: Layers,
      iconStyle: "bg-slate-100 dark:bg-[#141719] text-slate-700 dark:text-[#9AA1A9] border border-slate-200 dark:border-[#2A2E32]",
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
            className="group relative cursor-pointer border border-slate-200 dark:border-[#2A2E32] bg-white dark:bg-[#181B1D] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-600"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9AA1A9]">
                  {card.title}
                </p>
                <h3
                  className={`text-2xl font-bold tracking-tight font-mono ${
                    card.isProfit !== undefined
                      ? card.isProfit
                        ? "text-[#00C896]"
                        : "text-[#FF4D5A]"
                      : "text-slate-900 dark:text-[#F1F3F5]"
                  }`}
                >
                  {card.value}
                </h3>
                {card.subtitle && (
                  <p
                    className={`text-xs font-medium ${
                      card.isProfit !== undefined
                        ? card.isProfit
                          ? "text-[#00C896]"
                          : "text-[#FF4D5A]"
                        : "text-slate-500 dark:text-[#6F7780]"
                    }`}
                  >
                    {card.subtitle}
                  </p>
                )}
              </div>

              <div className={`rounded-xl p-2.5 shrink-0 ${card.iconStyle}`}>
                <Icon size={18} strokeWidth={2} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}