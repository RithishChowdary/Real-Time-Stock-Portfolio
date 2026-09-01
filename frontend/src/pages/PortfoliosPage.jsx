import { Plus, RotateCcw, Banknote, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import PortfolioCard from "../components/portfolio/PortfolioCard";
import PortfolioForm from "../components/portfolio/PortfolioForm";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Loader from "../components/ui/Loader";
import {
  createPortfolio,
  deletePortfolio,
  getPortfolios,
  updatePortfolio,
} from "../services/portfolioService";
import { getAccount, resetAccount } from "../services/accountService";
import { formatCurrency } from "../utils/formatters";

export default function PortfoliosPage() {
  const [portfolios, setPortfolios] = useState([]);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [portfolioData, accountData] = await Promise.all([
        getPortfolios(),
        getAccount().catch(() => null),
      ]);
      setPortfolios(portfolioData || []);
      setAccount(accountData);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load portfolios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreate(payload) {
    const created = await createPortfolio(payload);
    setPortfolios((current) => [created, ...current]);
    setShowCreate(false);
    setSuccess(`Portfolio "${created.portfolioName}" created.`);
  }

  async function handleUpdate(payload) {
    const updated = await updatePortfolio(editingPortfolio.id, payload);

    setPortfolios((current) =>
      current.map((portfolio) =>
        portfolio.id === updated.id ? updated : portfolio
      )
    );

    setEditingPortfolio(null);
    setSuccess(`Portfolio updated successfully.`);
  }

  async function handleDelete(portfolio) {
    const confirmed = window.confirm(
      `Delete "${portfolio.portfolioName}"? This also removes its transactions.`
    );

    if (!confirmed) return;

    await deletePortfolio(portfolio.id);

    setPortfolios((current) =>
      current.filter((item) => item.id !== portfolio.id)
    );
  }

  async function handleResetCapital() {
    const confirmed = window.confirm(
      "Reset your paper-trading cash balance back to ₹1,00,000.00?"
    );
    if (!confirmed) return;

    try {
      const reset = await resetAccount();
      setAccount(reset);
      setSuccess("Paper trading wallet reset to ₹1,00,000.00 successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset paper account");
    }
  }

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Portfolio Management
          </p>
          <div className="border-b border-slate-200 dark:border-slate-800 pb-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Portfolios
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create, manage and monitor dedicated investment portfolios.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-green-500/20 text-green-600 hover:bg-green-500/25 border border-green-500/20 dark:text-green-400"
          >
            <Plus size={16} />
            New Portfolio
          </Button>
        </div>
      </div>

      {/* Account Cash Overview Banner */}
      {account && (
        <Card className="border border-emerald-200/60 bg-emerald-50/40 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400">
                <Banknote size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Paper Trading Capital
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                    <ShieldCheck size={11} /> Virtual
                  </span>
                </div>
                <p className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(account.availableCash)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Initial: <strong className="text-slate-700 dark:text-slate-300">{formatCurrency(account.initialBalance)}</strong>
              </span>
              <button
                type="button"
                onClick={handleResetCapital}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <RotateCcw size={12} />
                Reset Wallet
              </button>
            </div>
          </div>
        </Card>
      )}

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

      {showCreate && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Create Portfolio
          </h2>
          <PortfolioForm
            submitLabel="Create Portfolio"
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        </Card>
      )}

      {editingPortfolio && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Rename Portfolio
          </h2>
          <PortfolioForm
            initialName={editingPortfolio.portfolioName}
            submitLabel="Update Portfolio"
            onSubmit={handleUpdate}
            onCancel={() => setEditingPortfolio(null)}
          />
        </Card>
      )}

      {!portfolios.length ? (
        <EmptyState
          title="No portfolios created"
          message="Create a portfolio to start tracking holdings, transactions, investment value, and returns."
          action={
            <Button
              onClick={() => setShowCreate(true)}
              className="bg-green-500/20 text-green-600 hover:bg-green-500/25 border border-green-500/20 dark:text-green-400"
            >
              <Plus size={16} />
              Create Portfolio
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {portfolios.map((portfolio) => (
            <PortfolioCard
              key={portfolio.id}
              portfolio={portfolio}
              onEdit={setEditingPortfolio}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
