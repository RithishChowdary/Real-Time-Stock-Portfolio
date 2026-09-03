import { Plus, Search, Filter, ChevronDown } from "lucide-react";
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
  const [size] = useState(10);

  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [refreshingSymbol, setRefreshingSymbol] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sortBy, setSortBy] = useState("symbol");
  const [filterMode, setFilterMode] = useState("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );

  async function loadStocks(nextPage = page) {
    setLoading(true);
    setError("");

    try {
      const data = await getStocks(nextPage, size);
      setPageData(data);
      setStocks(data.content || []);
      setPage(nextPage);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load stocks"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStocks(0);
  }, []);

  async function handleCreate(payload) {
    setError("");
    setSuccess("");

    try {
      await createStock(payload);
      setShowCreate(false);
      setSuccess("Stock created successfully");
      await loadStocks(0);
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Only ADMIN users can create stocks.");
      } else {
        setError(
          err.response?.data?.message || "Unable to create stock"
        );
      }
    }
  }

  async function handleRefresh(symbol) {
    setRefreshingSymbol(symbol);
    setError("");
    setSuccess("");

    try {
      const updatedStock = await refreshStockPrice(symbol);
      setStocks((current) =>
        current.map((stock) =>
          stock.symbol === updatedStock.symbol ? updatedStock : stock
        )
      );
      setSuccess(`${symbol} price refreshed successfully`);
    } catch (err) {
      setError(
        err.response?.data?.message || `Unable to refresh ${symbol}`
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

  const filteredStocks = [...stocks]
    .filter((stock) => {
      const matchesSearch =
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.companyName.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (filterMode === "high") {
        return Number(stock.currentPrice || 0) >= 1000;
      }
      if (filterMode === "low") {
        return Number(stock.currentPrice || 0) < 1000;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "symbol") {
        return a.symbol.localeCompare(b.symbol);
      }
      if (sortBy === "symbol_desc") {
        return b.symbol.localeCompare(a.symbol);
      }
      if (sortBy === "price_desc" || sortBy === "price") {
        return b.currentPrice - a.currentPrice;
      }
      if (sortBy === "price_asc") {
        return a.currentPrice - b.currentPrice;
      }
      return 0;
    });

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="border-b border-slate-200 dark:border-[#2A2E32] pb-1.5 inline-block w-full">
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-[#3B82F6]">
              Market Management
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-[#F1F3F5]">
              Stocks & Equities
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#9AA1A9]">
            Real-time Indian equities watchlist, live price feeds, and attached institutional research reports.
          </p>
        </div>

        <Button
          onClick={() => setShowCreate(true)}
          variant="primary"
          className="self-start sm:self-auto h-10 px-4 text-xs sm:text-sm"
        >
          <Plus size={16} />
          <span>Add Stock</span>
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-sm text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-[#00C896]/30 bg-[#00C896]/10 p-3.5 text-sm font-semibold text-[#00C896]">
          {success}
        </div>
      )}

      {/* Create Form (Admin) */}
      {showCreate && (
        <Card className="border border-slate-200 dark:border-[#2A2E32] bg-white dark:bg-[#181B1D]">
          <h2 className="mb-3 text-base font-bold text-slate-900 dark:text-[#F1F3F5]">
            Register New Stock Master Record
          </h2>
          <StockForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
          <p className="mt-2 text-xs text-slate-500 dark:text-[#6F7780]">
            Note: Admin privileges required to commit new ticker symbols.
          </p>
        </Card>
      )}

      {/* Search, Filter & Sort Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-xl">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#6F7780]"
          />
          <input
            type="text"
            placeholder="Search by symbol or company name (e.g. TCS, Infosys)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 w-full rounded-xl border-2 border-slate-300 dark:border-[#2A2E32] bg-white dark:bg-[#141719] pl-11 pr-4 text-xs sm:text-sm text-slate-900 dark:text-[#F1F3F5] placeholder:text-slate-400 dark:placeholder:text-[#6F7780] hover:border-slate-400 dark:hover:border-slate-600 focus:border-[#3B82F6] focus:outline-none transition-colors"
          />
        </div>

        {/* Filter & Sort */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Filter Control */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`inline-flex h-11 items-center gap-2 rounded-xl border-2 px-4 text-xs font-semibold transition-all duration-150 cursor-pointer ${
                filterMode !== "all" || showFilterDropdown
                  ? "border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]"
                  : "border-slate-300 dark:border-[#2A2E32] bg-white dark:bg-[#141719] text-slate-700 dark:text-[#F1F3F5] hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-[#1D2023]"
              }`}
            >
              <Filter size={15} />
              <span>Filter</span>
              {filterMode !== "all" && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6]"></span>
              )}
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 top-13 z-30 w-48 rounded-xl border-2 border-slate-200 dark:border-[#2A2E32] bg-white dark:bg-[#181B1D] p-1.5 shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    setFilterMode("all");
                    setShowFilterDropdown(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium cursor-pointer ${
                    filterMode === "all"
                      ? "bg-[#3B82F6]/10 text-[#3B82F6] font-semibold"
                      : "text-slate-700 dark:text-[#9AA1A9] hover:bg-slate-100 dark:hover:bg-[#1D2023]"
                  }`}
                >
                  <span>All Equities</span>
                  {filterMode === "all" && <span>✓</span>}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFilterMode("high");
                    setShowFilterDropdown(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium cursor-pointer ${
                    filterMode === "high"
                      ? "bg-[#3B82F6]/10 text-[#3B82F6] font-semibold"
                      : "text-slate-700 dark:text-[#9AA1A9] hover:bg-slate-100 dark:hover:bg-[#1D2023]"
                  }`}
                >
                  <span>Price &ge; ₹1,000</span>
                  {filterMode === "high" && <span>✓</span>}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFilterMode("low");
                    setShowFilterDropdown(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium cursor-pointer ${
                    filterMode === "low"
                      ? "bg-[#3B82F6]/10 text-[#3B82F6] font-semibold"
                      : "text-slate-700 dark:text-[#9AA1A9] hover:bg-slate-100 dark:hover:bg-[#1D2023]"
                  }`}
                >
                  <span>Price &lt; ₹1,000</span>
                  {filterMode === "low" && <span>✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-11 appearance-none rounded-xl border-2 border-slate-300 dark:border-[#2A2E32] bg-white dark:bg-[#141719] pl-4 pr-9 text-xs font-semibold text-slate-700 dark:text-[#F1F3F5] hover:border-slate-400 dark:hover:border-slate-600 focus:border-[#3B82F6] focus:outline-none cursor-pointer"
            >
              <option value="symbol">Sort by Symbol (A-Z)</option>
              <option value="symbol_desc">Sort by Symbol (Z-A)</option>
              <option value="price_desc">Sort by Price (High to Low)</option>
              <option value="price_asc">Sort by Price (Low to High)</option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#6F7780]"
            />
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <StockTable
        stocks={filteredStocks}
        refreshingSymbol={refreshingSymbol}
        onRefresh={handleRefresh}
      />

      {/* Pagination */}
      <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 dark:border-[#2A2E32] bg-slate-50 dark:bg-[#141719] p-3.5 sm:flex-row sm:items-center">
        <p className="text-xs text-slate-500 dark:text-[#9AA1A9] font-mono">
          Page <span className="font-semibold text-slate-900 dark:text-[#F1F3F5]">{page + 1}</span>
          {pageData?.totalPages && (
            <> of <span className="font-semibold text-slate-900 dark:text-[#F1F3F5]">{pageData.totalPages}</span></>
          )}
        </p>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={page <= 0}
            onClick={goToPreviousPage}
            className="h-8 px-3 text-xs"
          >
            Previous
          </Button>

          <Button
            variant="secondary"
            disabled={pageData?.last}
            onClick={goToNextPage}
            className="h-8 px-3 text-xs"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}