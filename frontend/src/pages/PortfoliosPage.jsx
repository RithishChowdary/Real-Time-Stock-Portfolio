import { Plus, RotateCcw, Banknote, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import PortfolioCard from "../components/portfolio/PortfolioCard";
import PortfolioForm from "../components/portfolio/PortfolioForm";
import PortfolioRiskAnalysis from "../components/portfolio/PortfolioRiskAnalysis";
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
          <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-[#3B82F6]">
            Portfolio Management
          </p>
          <div className="border-b border-slate-200 dark:border-[#2A2E32] pb-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-[#F1F3F5]">
              Portfolios
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#9AA1A9]">
            Create, manage and monitor dedicated investment portfolios.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={() => setShowCreate(true)}
          >
            <Plus size={16} />
            New Portfolio
          </Button>
        </div>
      </div>

      {/* Account Cash Overview Banner */}
      {account && (
        <Card className="border border-slate-200 dark:border-[#2A2E32] bg-slate-50 dark:bg-[#181B1D] p-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#00C896]/10 p-2.5 text-[#00C896] border border-[#00C896]/20">
                <Banknote size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-[#9AA1A9]">
                    Paper Trading Capital
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-[#00C896]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#00C896] border border-[#00C896]/20">
                    <ShieldCheck size={11} /> Virtual
                  </span>
                </div>
                <p className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-[#F1F3F5]">
                  {formatCurrency(account.availableCash)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-500 dark:text-[#9AA1A9]">
                Initial: <strong className="text-slate-700 dark:text-[#F1F3F5]">{formatCurrency(account.initialBalance)}</strong>
              </span>
              <button
                type="button"
                onClick={handleResetCapital}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-300 dark:border-[#2A2E32] bg-white dark:bg-[#141719] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-[#F1F3F5] transition hover:bg-slate-100 dark:hover:bg-[#1D2023] cursor-pointer"
              >
                <RotateCcw size={12} />
                Reset Wallet
              </button>
            </div>
          </div>
        </Card>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-sm font-medium text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-[#00C896]/30 bg-[#00C896]/10 p-4 text-sm font-semibold text-[#00C896]">
          {success}
        </div>
      )}

      {showCreate && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-[#F1F3F5]">
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
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-[#F1F3F5]">
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
              variant="primary"
              onClick={() => setShowCreate(true)}
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

      {/* AI Portfolio Risk Analysis Section */}
      <PortfolioRiskAnalysis />
    </div>
  );
}
