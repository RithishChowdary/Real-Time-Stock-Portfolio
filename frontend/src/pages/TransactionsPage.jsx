import { useEffect, useState } from "react";
import BuySellForm from "../components/transactions/BuySellForm";
import PortfolioSummaryCards from "../components/transactions/PortfolioSummaryCards";
import TransactionTable from "../components/transactions/TransactionTable";
import HoldingsTable from "../components/dashboard/HoldingsTable";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Loader from "../components/ui/Loader";
import Button from "../components/ui/Button";
import { getPortfolios } from "../services/portfolioService";
import { getAccount } from "../services/accountService";
import {
  buyStock,
  getPortfolioHoldings,
  getPortfolioSummary,
  getPortfolioTransactions,
  sellStock,
} from "../services/transactionService";

export default function TransactionsPage() {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState("");
  const [availableCash, setAvailableCash] = useState(0);
  const [summary, setSummary] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [pageData, setPageData] = useState(null);
  const [page, setPage] = useState(0);
  const [mode, setMode] = useState("BUY");
  const [loading, setLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadAccountData() {
    try {
      const accountData = await getAccount();
      setAvailableCash(Number(accountData?.availableCash || 0));
    } catch {
      // Gracefully fallback
    }
  }

  async function loadInitialData() {
    setLoading(true);
    setError("");

    try {
      const [portfolioData, accountData] = await Promise.all([
        getPortfolios(),
        getAccount().catch(() => null),
      ]);

      setPortfolios(portfolioData || []);
      if (accountData?.availableCash !== undefined) {
        setAvailableCash(Number(accountData.availableCash));
      }

      const firstPortfolioId = portfolioData?.[0]?.id || "";
      setSelectedPortfolioId(firstPortfolioId);

      if (firstPortfolioId) {
        await loadPortfolioData(firstPortfolioId, 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load transaction page");
    } finally {
      setLoading(false);
    }
  }

  async function loadPortfolioData(portfolioId, nextPage = 0) {
    if (!portfolioId) return;

    setSectionLoading(true);
    setError("");

    try {
      const [summaryData, holdingsData, transactionsData] = await Promise.all([
        getPortfolioSummary(portfolioId),
        getPortfolioHoldings(portfolioId),
        getPortfolioTransactions(portfolioId, nextPage, 5),
      ]);

      setSummary(summaryData);
      setHoldings(holdingsData || []);
      setTransactions(transactionsData?.content || []);
      setPageData(transactionsData);
      setPage(nextPage);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load portfolio data");
    } finally {
      setSectionLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  async function handlePortfolioChange(event) {
    const portfolioId = event.target.value;
    setSelectedPortfolioId(portfolioId);
    await loadPortfolioData(portfolioId, 0);
  }

  async function handleBuy(payload) {
    setError("");
    setSuccess("");

    try {
      await buyStock(payload);
      setSuccess(`BUY order for ${payload.quantity} ${payload.symbol} placed successfully.`);
      await Promise.all([
        loadAccountData(),
        loadPortfolioData(payload.portfolioId, 0),
      ]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to execute BUY trade");
      throw err; // Let form show inline error as well
    }
  }

  async function handleSell(payload) {
    setError("");
    setSuccess("");

    try {
      await sellStock(payload);
      setSuccess(`SELL order for ${payload.quantity} ${payload.symbol} placed successfully.`);
      await Promise.all([
        loadAccountData(),
        loadPortfolioData(payload.portfolioId, 0),
      ]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to execute SELL trade");
      throw err;
    }
  }

  function goToPreviousPage() {
    if (page > 0) {
      loadPortfolioData(selectedPortfolioId, page - 1);
    }
  }

  function goToNextPage() {
    if (!pageData?.last) {
      loadPortfolioData(selectedPortfolioId, page + 1);
    }
  }

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
          <div className="border-b border-slate-200 dark:border-slate-800 pb-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Transactions & Paper Trading
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Execute paper orders with virtual capital and monitor live portfolio holdings.
          </p>
        </div>

        {portfolios.length > 0 && (
          <label className="block min-w-[260px]">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Portfolio
            </span>
            <select
              value={selectedPortfolioId}
              onChange={handlePortfolioChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-500"
            >
              {portfolios.map((portfolio) => (
                <option key={portfolio.id} value={portfolio.id}>
                  {portfolio.portfolioName}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-300">
          {success}
        </div>
      )}

      {!portfolios.length ? (
        <EmptyState
          title="No active portfolio"
          message="Create a portfolio first, then record buy and sell transactions against your selected holdings."
          action={
            <Button
              onClick={() => {
                window.location.href = "/portfolios";
              }}
              variant="secondary"
            >
              Go to Portfolios
            </Button>
          }
        />
      ) : (
        <>
          {/* Summary Cards with Cash Balance */}
          <PortfolioSummaryCards summary={summary} availableCash={availableCash} />

          <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
            {/* Trading Form Card */}
            <Card className="h-fit">
              <div className="mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Place Paper Order
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select BUY to accumulate or SELL to liquidate positions.
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setMode("BUY")}
                  className={`rounded-md py-2 text-sm font-bold transition ${
                    mode === "BUY"
                      ? "bg-white text-green-600 shadow-sm dark:bg-slate-900 dark:text-green-400"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  BUY
                </button>

                <button
                  type="button"
                  onClick={() => setMode("SELL")}
                  className={`rounded-md py-2 text-sm font-bold transition ${
                    mode === "SELL"
                      ? "bg-white text-red-600 shadow-sm dark:bg-slate-900 dark:text-red-400"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  SELL
                </button>
              </div>

              <BuySellForm
                portfolios={portfolios}
                defaultPortfolioId={selectedPortfolioId}
                mode={mode}
                holdings={holdings}
                availableCash={availableCash}
                onSubmit={mode === "BUY" ? handleBuy : handleSell}
              />
            </Card>

            {/* Holdings & Transaction History */}
            <div className="space-y-6">
              {sectionLoading ? (
                <Loader />
              ) : (
                <>
                  <HoldingsTable holdings={holdings} />
                  <TransactionTable transactions={transactions} />

                  {/* Pagination */}
                  {transactions.length > 0 && (
                    <Card className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Page <span className="font-bold text-slate-800 dark:text-slate-200">{page + 1}</span>
                        {pageData?.totalPages ? (
                          <>
                            {" "}of{" "}
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {pageData.totalPages}
                            </span>
                          </>
                        ) : null}
                      </p>

                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          disabled={page <= 0}
                          onClick={goToPreviousPage}
                          className="py-1.5 text-xs"
                        >
                          Previous
                        </Button>

                        <Button
                          variant="secondary"
                          disabled={pageData?.last}
                          onClick={goToNextPage}
                          className="py-1.5 text-xs"
                        >
                          Next
                        </Button>
                      </div>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
