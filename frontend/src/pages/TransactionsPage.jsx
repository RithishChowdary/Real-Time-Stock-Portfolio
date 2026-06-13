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

  async function loadInitialData() {
    setLoading(true);
    setError("");

    try {
      const portfolioData = await getPortfolios();
      setPortfolios(portfolioData);

      const firstPortfolioId = portfolioData[0]?.id || "";
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
      setHoldings(holdingsData);
      setTransactions(transactionsData.content || []);
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
      setSuccess("Stock bought successfully");
      await loadPortfolioData(payload.portfolioId, 0);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to buy stock");
    }
  }

  async function handleSell(payload) {
    setError("");
    setSuccess("");

    try {
      await sellStock(payload);
      setSuccess("Stock sold successfully");
      await loadPortfolioData(payload.portfolioId, 0);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to sell stock");
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
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
      <div className="border-b border-slate-200 dark:border-slate-800 pb-1.5">
    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
    Transactions
  </h1>
</div>


          <p className="mt-1 text-sm text-slate-500">
            Buy, sell, and review portfolio activity.
          </p>
        </div>

        <label className="block min-w-[260px]">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Active Portfolio
          </span>
          <select
            value={selectedPortfolioId}
            onChange={handlePortfolioChange}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            {portfolios.map((portfolio) => (
              <option key={portfolio.id} value={portfolio.id}>
                {portfolio.portfolioName}
              </option>
            ))}
          </select>
        </label>
      </div>

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
          <PortfolioSummaryCards summary={summary} />

          <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
            <Card>
              <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
                <button
                  onClick={() => setMode("BUY")}
                  className={`rounded-md px-4 py-2 text-sm font-semibold ${
                    mode === "BUY"
                      ? "bg-white text-green-700 shadow-sm"
                      : "text-slate-600"
                  }`}
                >
                  Buy
                </button>

                <button
                  onClick={() => setMode("SELL")}
                  className={`rounded-md px-4 py-2 text-sm font-semibold ${
                    mode === "SELL"
                      ? "bg-white text-red-700 shadow-sm"
                      : "text-slate-600"
                  }`}
                >
                  Sell
                </button>
              </div>

              <BuySellForm
                portfolios={portfolios}
                defaultPortfolioId={selectedPortfolioId}
                mode={mode}
                onSubmit={mode === "BUY" ? handleBuy : handleSell}
              />
            </Card>

            <div className="space-y-6">
              {sectionLoading ? (
                <Loader />
              ) : (
                <>
                  <HoldingsTable holdings={holdings} />
                  <TransactionTable transactions={transactions} />

                  <Card className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <p className="text-sm text-slate-600">
                      Page <span className="font-semibold">{page + 1}</span>
                      {pageData?.totalPages ? (
                        <>
                          {" "}of{" "}
                          <span className="font-semibold">
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
                      >
                        Previous
                      </Button>

                      <Button
                        variant="secondary"
                        disabled={pageData?.last}
                        onClick={goToNextPage}
                      >
                        Next
                      </Button>
                    </div>
                  </Card>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
