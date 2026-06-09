import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import Card from "../ui/Card";
import { formatCurrency, formatPercentage } from "../../utils/formatters";

export default function PortfolioSummaryCards({ summary }) {
  const profitLoss = Number(summary?.totalProfitLoss || 0);
  const isProfit = profitLoss >= 0;

  const cards = [
    {
      label: "Investment",
      value: formatCurrency(summary?.totalInvestment),
      icon: Wallet,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Current Value",
      value: formatCurrency(summary?.currentValue),
      icon: Wallet,
      color: "bg-indigo-50 text-indigo-700",
    },
    {
      label: "Profit / Loss",
      value: formatCurrency(summary?.totalProfitLoss),
      icon: isProfit ? TrendingUp : TrendingDown,
      color: isProfit ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700",
    },
    {
      label: "Return",
      value: formatPercentage(summary?.returnPercentage),
      icon: isProfit ? TrendingUp : TrendingDown,
      color: isProfit ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700",
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
              </div>

              <div className={`rounded-lg p-3 ${card.color}`}>
                <Icon size={19} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}