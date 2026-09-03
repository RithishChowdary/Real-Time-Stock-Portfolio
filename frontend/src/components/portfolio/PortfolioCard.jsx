import {
  Calendar,
  Edit3,
  Trash2,
  Wallet,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Card from "../ui/Card";
import Button from "../ui/Button";

import {
  getPortfolioHoldings,
  getPortfolioSummary,
} from "../../services/transactionService";

import {
  formatCurrency,
  formatDateTime,
  formatPercentage,
} from "../../utils/formatters";

export default function PortfolioCard({
  portfolio,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [holdingsCount, setHoldingsCount] = useState(0);

  useEffect(() => {
    async function loadStats() {
      try {
        const [summaryData, holdingsData] = await Promise.all([
          getPortfolioSummary(portfolio.id),
          getPortfolioHoldings(portfolio.id),
        ]);

        setSummary(summaryData);
        setHoldingsCount(holdingsData?.length || 0);
      } catch (error) {
        console.error("Failed loading portfolio stats", error);
      }
    }

    loadStats();
  }, [portfolio.id]);

  const isProfit = Number(summary?.totalProfitLoss || 0) >= 0;

  return (
    <Card
      className="relative cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-[#3B82F6] border border-slate-200 dark:border-[#2A2E32] bg-white dark:bg-[#181B1D]"
      onClick={() => navigate(`/portfolios/${portfolio.id}`)}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">
          <Wallet size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <Link
              to={`/portfolios/${portfolio.id}`}
              className="text-lg font-bold text-slate-900 hover:text-[#3B82F6] dark:text-[#F1F3F5] truncate"
            >
              {portfolio.portfolioName}
            </Link>
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#9AA1A9]">
            <Calendar size={13} />
            <span>{formatDateTime(portfolio.createdAt)}</span>
          </div>

          {portfolio.user && (
            <p className="mt-1 text-xs text-slate-500 dark:text-[#6F7780]">
              Owner: {portfolio.user.name}
            </p>
          )}

          {/* Stats Breakdown */}
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-200 dark:border-[#2A2E32] pt-3 text-xs">
            <div>
              <p className="text-slate-500 dark:text-[#9AA1A9]">Holdings</p>
              <p className="mt-0.5 font-bold text-slate-900 dark:text-[#F1F3F5]">
                {holdingsCount}
              </p>
            </div>

            <div>
              <p className="text-slate-500 dark:text-[#9AA1A9]">Current Value</p>
              <p className="mt-0.5 font-bold text-slate-900 dark:text-[#F1F3F5]">
                {formatCurrency(summary?.currentValue || 0)}
              </p>
            </div>

            <div>
              <p className="text-slate-500 dark:text-[#9AA1A9]">Return</p>
              <p
                className={`mt-0.5 flex items-center gap-0.5 font-bold ${
                  isProfit ? "text-[#00C896]" : "text-[#FF4D5A]"
                }`}
              >
                {isProfit ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                <span>{formatPercentage(summary?.returnPercentage || 0)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2 border-t border-slate-100 dark:border-[#2A2E32] pt-3">
        <Button
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(portfolio);
          }}
          className="text-xs py-1.5 px-3"
        >
          <Edit3 size={13} />
          Rename
        </Button>

        <Button
          variant="danger"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(portfolio);
          }}
          className="text-xs py-1.5 px-3"
        >
          <Trash2 size={13} />
          Delete
        </Button>
      </div>
    </Card>
  );
}