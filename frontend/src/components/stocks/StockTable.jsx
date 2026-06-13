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

  const [researchMap, setResearchMap] =
    useState({});
  const [researchLoading, setResearchLoading] =
    useState(false);

  useEffect(() => {

    async function loadResearch() {

      setResearchLoading(true);

      const entries =
        await Promise.all(
          (stocks || []).map(async (stock) => {
            try {
              const research =
                await getResearchByStock(
                  stock.id
                );

              return [
                stock.id,
                research,
              ];
            } catch (error) {
              console.error(
                "Failed loading research:",
                stock.id,
                error
              );

              return [
                stock.id,
                [],
              ];
            }
          })
        );

      setResearchMap(
        Object.fromEntries(entries)
      );
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
    <Card>

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Available Stocks
        </h2>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Monitor listed equities, refresh market prices, and review attached research reports.
        </p>
      </div>

      <div className="overflow-x-auto">

        <table className="w-full min-w-[720px] text-left text-sm">

          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
            <tr>
              <th className="py-3">
                Symbol
              </th>

              <th className="py-3">
                Company
              </th>

              <th className="py-3">
                Current Price
              </th>

              <th className="py-3">
                Last Updated
              </th>

              <th className="py-3 text-right">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

            {stocks.map((stock) => (

              <tr key={stock.id}>

                <td className="py-4 font-semibold text-slate-900 dark:text-white">
                  {stock.symbol}
                </td>

                <td className="py-4 text-slate-600 dark:text-slate-300">

                  <div>
                    {stock.companyName}
                  </div>

                  {researchLoading && (
                    <div className="mt-3 max-w-md space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-72" />
                    </div>
                  )}

                  {!researchLoading &&
                    researchMap[stock.id]?.length >
                      0 && (

                    <div className="mt-3 max-w-xl rounded-lg border border-blue-100 bg-blue-50/80 p-3 dark:border-blue-900/50 dark:bg-blue-950/20">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 dark:bg-slate-900 dark:text-blue-400">
                          <FileText size={16} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                            {researchMap[stock.id][0].title ||
                              "Research report"}
                          </p>

                          {researchMap[stock.id][0].summary && (
                            <p className="mt-1 max-h-10 overflow-hidden text-xs leading-5 text-slate-600 dark:text-slate-400">
                              {researchMap[stock.id][0].summary}
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <a
                              href={getResearchDownloadUrl(
                                researchMap[stock.id][0].pdfUrl
                              )}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400"
                            >
                              <Download size={14} />
                              Download PDF
                            </a>

                            {researchMap[stock.id][0].sourceUrl && (
                              <a
                                href={researchMap[stock.id][0].sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-white"
                              >
                                <ExternalLink size={14} />
                                Source
                              </a>
                            )}

                            {researchMap[stock.id][0].createdAt && (
                              <span className="text-xs text-slate-500 dark:text-slate-500">
                                {formatDateTime(
                                  researchMap[stock.id][0].createdAt
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                  )}

                </td>

                <td className="py-4 font-semibold">
                  {formatCurrency(
                    stock.currentPrice
                  )}
                </td>

                <td className="py-4 text-slate-500">
                  {formatDateTime(
                    stock.lastUpdated
                  )}
                </td>

                <td className="py-4 text-right">

                  <Button
                    variant="secondary"
                    disabled={
                      refreshingSymbol ===
                      stock.symbol
                    }
                    onClick={() =>
                      onRefresh(
                        stock.symbol
                      )
                    }
                  >

                    <RefreshCcw size={15} />

                    {refreshingSymbol ===
                    stock.symbol
                      ? "Refreshing..."
                      : "Refresh"}

                  </Button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </Card>
  );
}
