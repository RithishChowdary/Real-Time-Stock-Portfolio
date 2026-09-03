import { TrendingDown, TrendingUp, Wallet, Banknote } from "lucide-react";
import Card from "../ui/Card";
import { formatCurrency, formatPercentage } from "../../utils/formatters";

export default function PortfolioSummaryCards({ summary, availableCash }) {
  const profitLoss = Number(summary?.totalProfitLoss || 0);
  const isProfit = profitLoss >= 0;

  const cards = [
    {
      label: "Available Cash",
      value: formatCurrency(availableCash ?? summary?.availableCash ?? 0),
      icon: Banknote,
      color: "bg-[#00C896]/10 text-[#00C896] border border-[#00C896]/20",
    },
    {
      label: "Invested Cost",
      value: formatCurrency(summary?.totalInvestment || 0),
      icon: Wallet,
      color: "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20",
    },
    {
      label: "Current Value",
      value: formatCurrency(summary?.currentValue || 0),
      icon: Wallet,
      color: "bg-slate-100 dark:bg-[#1D2023] text-slate-700 dark:text-[#F1F3F5] border border-slate-200 dark:border-[#2A2E32]",
    },
    {
      label: "Unrealized P&L",
      value: (isProfit && profitLoss > 0 ? "+" : "") + formatCurrency(summary?.totalProfitLoss || 0),
      percentage: (isProfit ? "+" : "") + formatPercentage(summary?.returnPercentage || 0),
      icon: isProfit ? TrendingUp : TrendingDown,
      color: isProfit
        ? "bg-[#00C896]/10 text-[#00C896] border border-[#00C896]/20"
        : "bg-[#FF4D5A]/10 text-[#FF4D5A] border border-[#FF4D5A]/20",
      isProfit,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.label} className="border border-slate-200 dark:border-[#2A2E32] bg-white dark:bg-[#181B1D]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9AA1A9]">
                  {card.label}
                </p>
                <p className="mt-2 text-xl font-bold text-slate-900 dark:text-[#F1F3F5]">
                  {card.value}
                </p>
                {card.percentage && (
                  <p
                    className={`mt-1 text-xs font-bold ${
                      card.isProfit ? "text-[#00C896]" : "text-[#FF4D5A]"
                    }`}
                  >
                    {card.percentage}
                  </p>
                )}
              </div>

              <div className={`rounded-xl p-3 ${card.color}`}>
                <Icon size={18} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}