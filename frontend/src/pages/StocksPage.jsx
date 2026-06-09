import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import StockForm from "../components/stocks/StockForm";
import StockTable from "../components/stocks/StockTable";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Loader from "../components/ui/Loader";

import {
  createStock,
  getStocks,
  refreshStockPrice,
} from "../services/stockService";

export default function StocksPage() {
  const [stocks, setStocks] = useState([]);
  const [pageData, setPageData] = useState(null);
  const [page, setPage] = useState(0);
  const [size] = useState(5);

  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);

  const [refreshingSymbol, setRefreshingSymbol] =
    useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [sortBy, setSortBy] =
    useState("symbol");

  const [searchParams] =
    useSearchParams();

  const [searchTerm, setSearchTerm] =
    useState(
      searchParams.get("search") || ""
    );

  async function loadStocks(
    nextPage = page
  ) {
    setLoading(true);
    setError("");

    try {
      const data =
        await getStocks(
          nextPage,
          size
        );

      setPageData(data);
      setStocks(data.content || []);
      setPage(nextPage);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load stocks"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStocks(0);
  }, []);

  async function handleCreate(
    payload
  ) {
    setError("");
    setSuccess("");

    try {
      await createStock(payload);

      setShowCreate(false);

      setSuccess(
        "Stock created successfully"
      );

      await loadStocks(0);
    } catch (err) {
      if (
        err.response?.status === 403
      ) {
        setError(
          "Only ADMIN users can create stocks."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to create stock"
        );
      }
    }
  }

  async function handleRefresh(
    symbol
  ) {
    setRefreshingSymbol(symbol);

    setError("");
    setSuccess("");

    try {
      const updatedStock =
        await refreshStockPrice(
          symbol
        );

      setStocks((current) =>
        current.map((stock) =>
          stock.symbol ===
          updatedStock.symbol
            ? updatedStock
            : stock
        )
      );

      setSuccess(
        `${symbol} price refreshed successfully`
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Unable to refresh ${symbol}`
      );
    } finally {
      setRefreshingSymbol("");
    }
  }

  function goToPreviousPage() {
    if (page > 0) {
      loadStocks(page - 1);
    }
  }

  function goToNextPage() {
    if (!pageData?.last) {
      loadStocks(page + 1);
    }
  }

  const filteredStocks =
    [...stocks]
      .filter(
        (stock) =>
          stock.symbol
            .toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            ) ||
          stock.companyName
            .toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            )
      )
      .sort((a, b) => {
        if (sortBy === "symbol") {
          return a.symbol.localeCompare(
            b.symbol
          );
        }

        if (sortBy === "price") {
          return (
            b.currentPrice -
            a.currentPrice
          );
        }

        return 0;
      });

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>

          <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-blue-600">
            Market Management
          </p>

          <div className="border-b border-slate-200 dark:border-slate-800 pb-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Stocks
            </h1>
          </div>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            View stock prices and refresh market values.
          </p>

        </div>

        <Button
          onClick={() =>
            setShowCreate(true)
          }
          className="bg-green-500/20 text-green-500 hover:bg-green-500/25 border border-green-500/20"
        >
          <Plus size={16} />
          Add Stock
        </Button>

      </div>

      {/* Alerts */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Create Form */}

      {showCreate && (
        <Card>

          <h2 className="mb-4 text-lg font-semibold">
            Create Stock
          </h2>

          <StockForm
            onSubmit={
              handleCreate
            }
            onCancel={() =>
              setShowCreate(false)
            }
          />

          <p className="mt-3 text-xs text-slate-500">
            Note: Only ADMIN can add stocks.
          </p>

        </Card>
      )}

      {/* Search & Sort */}

      <Card>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          <input
            type="text"
            placeholder="Search stocks..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
            className="h-10 rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
          />

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value
              )
            }
            className="h-10 rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="symbol">
              Sort by Symbol
            </option>

            <option value="price">
              Sort by Price
            </option>

          </select>

        </div>

      </Card>

      {/* Stock Table */}

      <StockTable
        stocks={filteredStocks}
        refreshingSymbol={
          refreshingSymbol
        }
        onRefresh={
          handleRefresh
        }
      />

      {/* Pagination */}

      <Card className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

        <p className="text-sm text-slate-600">
          Page{" "}
          <span className="font-semibold">
            {page + 1}
          </span>

          {pageData?.totalPages && (
            <>
              {" "}
              of{" "}
              <span className="font-semibold">
                {
                  pageData.totalPages
                }
              </span>
            </>
          )}
        </p>

        <div className="flex gap-2">

          <Button
            variant="secondary"
            disabled={page <= 0}
            onClick={
              goToPreviousPage
            }
          >
            Previous
          </Button>

          <Button
            variant="secondary"
            disabled={
              pageData?.last
            }
            onClick={
              goToNextPage
            }
          >
            Next
          </Button>

        </div>

      </Card>

    </div>
  );
}