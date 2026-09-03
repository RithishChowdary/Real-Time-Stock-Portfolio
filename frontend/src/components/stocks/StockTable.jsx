import { useEffect, useState } from "react";
import {
  Download,
  ExternalLink,
  FileText,
  RefreshCcw,
} from "lucide-react";

import Button from "../ui/Button";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import Skeleton from "../ui/Skeleton";

import {
  formatCurrency,
  formatDateTime,
} from "../../utils/formatters";

import {
  getResearchByStock,
  getResearchDownloadUrl,
} from "../../services/researchService";

export default function StockTable({
  stocks,
  refreshingSymbol,
  onRefresh,
}) {
  const [researchMap, setResearchMap] = useState({});
  const [researchLoading, setResearchLoading] = useState(false);

  useEffect(() => {
    async function loadResearch() {
      setResearchLoading(true);

      const entries = await Promise.all(
        (stocks || []).map(async (stock) => {
          try {
            const research = await getResearchByStock(stock.id);
            return [stock.id, research];
          } catch (error) {
            console.error("Failed loading research:", stock.id, error);
            return [stock.id, []];
          }
        })
      );

      setResearchMap(Object.fromEntries(entries));
      setResearchLoading(false);
    }

    if (stocks?.length) {
      loadResearch();
    } else {
      setResearchMap({});
    }
  }, [stocks]);

  if (!stocks?.length) {
    return (
      <EmptyState
        title="No stocks available yet"
        message="Add master stock records from the admin side so investors can track prices, create alerts, and place buy or sell transactions."
      />
    );
  }

  return (
    <Card className="overflow-hidden p-0 border border-slate-200 dark:border-[#2A2E32] bg-white dark:bg-[#181B1D]">
      <div className="border-b border-slate-200 dark:border-[#2A2E32] px-5 py-3.5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-[#F1F3F5]">
            Market Equities Watchlist
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#9AA1A9]">
            Live prices, exchange symbols, and attached institutional research
          </p>
        </div>
        <span className="rounded-lg bg-slate-100 dark:bg-[#141719] border border-slate-200 dark:border-[#2A2E32] px-2.5 py-1 font-mono text-xs font-semibold text-slate-700 dark:text-[#9AA1A9]">
          {stocks.length} Listed
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#2A2E32] bg-slate-50 dark:bg-[#141719] text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9AA1A9]">
              <th className="py-3 px-5">Equity</th>
              <th className="py-3 px-4">Current Price</th>
              <th className="py-3 px-4">Research & Notes</th>
              <th className="py-3 px-4">Last Updated</th>
              <th className="py-3 px-5 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-[#2A2E32]">
            {stocks.map((stock) => {
              const isRefreshing = refreshingSymbol === stock.symbol;
              const researchList = researchMap[stock.id] || [];
              const topResearch = researchList[0];

              return (
                <tr
                  key={stock.id}
                  className="transition-colors hover:bg-slate-50 dark:hover:bg-[#1D2023] group"
                >
                  {/* Symbol & Company Name */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-[#F1F3F5] bg-slate-100 dark:bg-[#141719] border border-slate-200 dark:border-[#2A2E32] px-2 py-0.5 rounded-lg">
                        {stock.symbol}
                      </span>
                      <div className="min-w-0">
                        <span className="block text-xs font-medium text-slate-900 dark:text-[#F1F3F5] truncate max-w-[200px]">
                          {stock.companyName}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-[#6F7780]">NSE / BSE</span>
                      </div>
                    </div>
                  </td>

                  {/* Current Price */}
                  <td className="py-3.5 px-4 font-mono font-bold text-sm text-slate-900 dark:text-[#F1F3F5]">
                    {formatCurrency(stock.currentPrice)}
                  </td>

                  {/* Research Cards */}
                  <td className="py-3.5 px-4">
                    {researchLoading ? (
                      <div className="space-y-1.5 max-w-xs">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    ) : topResearch ? (
                      <div className="rounded-lg border border-slate-200 dark:border-[#2A2E32] bg-slate-50 dark:bg-[#141719] p-2 max-w-xs">
                        <div className="flex items-start gap-2">
                          <FileText
                            size={14}
                            className="mt-0.5 shrink-0 text-[#3B82F6]"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-slate-900 dark:text-[#F1F3F5]">
                              {topResearch.title || "Research Note"}
                            </p>
                            {topResearch.summary && (
                              <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-[#9AA1A9]">
                                {topResearch.summary}
                              </p>
                            )}
                            <div className="mt-1.5 flex items-center gap-2.5">
                              <a
                                href={getResearchDownloadUrl(topResearch.pdfUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3B82F6] hover:text-blue-400 hover:underline"
                              >
                                <Download size={12} />
                                PDF
                              </a>
                              {topResearch.sourceUrl && (
                                <a
                                  href={topResearch.sourceUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-[#9AA1A9] hover:text-slate-900 dark:hover:text-[#F1F3F5]"
                                >
                                  <ExternalLink size={11} />
                                  Source
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-[#6F7780] font-mono">—</span>
                    )}
                  </td>

                  {/* Last Updated */}
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-500 dark:text-[#9AA1A9]">
                    {formatDateTime(stock.lastUpdated)}
                  </td>

                  {/* Refresh Button */}
                  <td className="py-3.5 px-5 text-right">
                    <Button
                      variant="secondary"
                      disabled={isRefreshing}
                      onClick={() => onRefresh(stock.symbol)}
                      className="h-8 px-2.5 text-xs font-semibold"
                    >
                      <RefreshCcw
                        size={13}
                        className={isRefreshing ? "animate-spin text-[#3B82F6]" : ""}
                      />
                      <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
