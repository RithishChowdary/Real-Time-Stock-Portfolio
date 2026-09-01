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
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Invested Value",
      value: formatCurrency(summary?.totalInvestment || 0),
      icon: Wallet,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Current Value",
      value: formatCurrency(summary?.currentValue || 0),
      icon: Wallet,
      color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Profit / Loss",
      value: formatCurrency(summary?.totalProfitLoss || 0),
      percentage: formatPercentage(summary?.returnPercentage || 0),
      icon: isProfit ? TrendingUp : TrendingDown,
      color: isProfit ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-600 dark:text-red-400",
      isProfit,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.label}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {card.label}
                </p>
                <p className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
                  {card.value}
                </p>
                {card.percentage && (
                  <p
                    className={`mt-1 text-xs font-semibold ${
                      card.isProfit ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {card.percentage}
                  </p>
                )}
              </div>

              <div className={`rounded-lg p-3 ${card.color}`}>
                <Icon size={20} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}