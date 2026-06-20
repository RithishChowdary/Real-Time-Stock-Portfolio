import { Plus } from "lucide-react";
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

export default function PortfoliosPage() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState(null);
  const [error, setError] = useState("");

  async function loadPortfolios() {
    setLoading(true);
    setError("");

    try {
      const data = await getPortfolios();
      setPortfolios(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load portfolios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPortfolios();
  }, []);

  async function handleCreate(payload) {
    const created = await createPortfolio(payload);
    setPortfolios((current) => [created, ...current]);
    setShowCreate(false);
  }

  async function handleUpdate(payload) {
    const updated = await updatePortfolio(editingPortfolio.id, payload);

    setPortfolios((current) =>
      current.map((portfolio) =>
        portfolio.id === updated.id ? updated : portfolio
      )
    );

    setEditingPortfolio(null);
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

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
         <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-blue-600">
  Portfolio Management
</p>
<div className="border-b border-slate-200 dark:border-slate-800 pb-1.5">
    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
       Portfolios
    </h1>
  </div>

<p className="mt-2 text-slate-500 dark:text-slate-400">
  Create and manage investment portfolios.
</p>
        </div>

        <Button
          onClick={() => setShowCreate(true)}
          className="bg-green-500/20 text-green-500 hover:bg-green-500/25 border border-green-500/20"
        >
          <Plus size={16} />
          New Portfolio
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {showCreate && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Create Portfolio</h2>
          <PortfolioForm
            submitLabel="Create Portfolio"
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        </Card>
      )}

      {editingPortfolio && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Rename Portfolio</h2>
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
