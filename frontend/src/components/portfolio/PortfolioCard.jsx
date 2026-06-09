import {
  Calendar,
  Edit3,
  Trash2,
  Wallet,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { ArrowUpRight } from "lucide-react";
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
        const [summaryData, holdingsData] =
          await Promise.all([
            getPortfolioSummary(portfolio.id),
            getPortfolioHoldings(portfolio.id),
          ]);

        setSummary(summaryData);
        setHoldingsCount(
          holdingsData?.length || 0
        );
      } catch (error) {
        console.error(
          "Failed loading portfolio stats",
          error
        );
      }
    }

    loadStats();
  }, [portfolio.id]);

  const isProfit =
    Number(summary?.totalProfitLoss || 0) >= 0;

  return (
    <Card
      className="relative cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-blue-500 hover:shadow-xl"
      onClick={() =>
        navigate(`/portfolios/${portfolio.id}`)
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Open
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Wallet size={22} />
        </div>

        <div className="flex-1">
          <Link
            to={`/portfolios/${portfolio.id}`}
            className="text-xl font-semibold text-slate-900 hover:text-blue-600 dark:text-white"
          >
            {portfolio.portfolioName}
          </Link>

          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <Calendar size={14} />
            {formatDateTime(
              portfolio.createdAt
            )}
          </div>

          {portfolio.user && (
            <>
              <p className="mt-2 text-sm text-slate-500">
                Owner: {portfolio.user.name}
              </p>
            </>
          )}

          {/* Dynamic Stats */}
          <div className="mt-5 grid grid-cols-3 gap-4 border-t border-slate-200 pt-4 dark:border-slate-800">
            <div>
              <p className="text-xs text-slate-500">
                Holdings
              </p>

              <p className="font-semibold">
                {holdingsCount}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Current Value
              </p>

              <p className="font-semibold">
                {formatCurrency(
                  summary?.currentValue || 0
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Return
              </p>

              <p
                className={`flex items-center gap-1 font-semibold ${
                  isProfit
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {isProfit ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                )}

                {formatPercentage(
                  summary?.returnPercentage || 0
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
                <Button
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(portfolio);
            }}
          >
          <Edit3 size={15} />
          Rename
        </Button>

                <Button
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(portfolio);
            }}
          >
          <Trash2 size={15} />
          Delete
        </Button>
      </div>
    </Card>
  );
}