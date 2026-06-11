import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";

import Button from "../ui/Button";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";

import {
  formatCurrency,
  formatDateTime,
} from "../../utils/formatters";

import { getResearchByStock } from "../../services/researchService";

export default function StockTable({
  stocks,
  refreshingSymbol,
  onRefresh,
}) {

  const [researchMap, setResearchMap] =
    useState({});

  useEffect(() => {

    async function loadResearch() {

      const map = {};

      for (const stock of stocks || []) {

        try {

          const research =
            await getResearchByStock(
              stock.id
            );

          map[stock.id] = research;

        } catch (error) {

          console.error(
            "Failed loading research:",
            stock.id,
            error
          );

          map[stock.id] = [];
        }
      }

      setResearchMap(map);
    }

    if (stocks?.length) {
      loadResearch();
    }

  }, [stocks]);

  if (!stocks?.length) {

    return (
      <EmptyState
        title="No stocks found"
        message="Create stocks as admin before users can buy or sell."
      />
    );
  }

  return (
    <Card>

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Available Stocks
        </h2>

        <p className="text-sm text-slate-500">
          Master list of stocks available for trading.
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

                  {researchMap[stock.id]?.length >
                    0 && (

                    <a
                      href={`https://real-time-stock-portfolio.onrender.com/api/research/download/${researchMap[stock.id][0].pdfUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block text-xs font-medium text-blue-500 hover:underline"
                    >
                      📄 Download Research
                    </a>

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