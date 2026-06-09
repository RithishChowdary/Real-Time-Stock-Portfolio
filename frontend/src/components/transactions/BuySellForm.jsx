import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { searchStocks } from "../../services/stockService";

export default function BuySellForm({
  portfolios,
  defaultPortfolioId,
  mode,
  onSubmit,
}) {
  const [form, setForm] = useState({
    portfolioId: defaultPortfolioId || "",
    symbol: "",
    quantity: "",
    price: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [stockSearch, setStockSearch] = useState("");
const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (defaultPortfolioId) {
      setForm((current) => ({
        ...current,
        portfolioId: defaultPortfolioId,
      }));
    }
  }, [defaultPortfolioId]);

  useEffect(() => {
  const timer = setTimeout(async () => {

    if (stockSearch.trim().length < 1) {
      setSearchResults([]);
      return;
    }

    try {

      const data =
        await searchStocks(stockSearch);

      setSearchResults(
        data.slice(0, 5)
      );

    } catch {

      setSearchResults([]);

    }

  }, 300);

  return () => clearTimeout(timer);

}, [stockSearch]);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.portfolioId || !form.symbol || !form.quantity || !form.price) {
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        portfolioId: Number(form.portfolioId),
        symbol: form.symbol.trim().toUpperCase(),
        quantity: Number(form.quantity),
        price: Number(form.price),
      });

     setForm((current) => ({
  ...current,
  symbol: "",
  quantity: "",
  price: "",
}));

setStockSearch("");
setSearchResults([]);

    } finally {
      setSubmitting(false);
    }
  }

  const isBuy = mode === "BUY";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          Portfolio
        </span>
        <select
          name="portfolioId"
          value={form.portfolioId}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">Select portfolio</option>
          {portfolios.map((portfolio) => (
            <option key={portfolio.id} value={portfolio.id}>
              {portfolio.portfolioName}
            </option>
          ))}
        </select>
      </label>

          <div className="relative">

  <label className="block">

    <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
      Stock Symbol
    </span>

    <input
      type="text"
      value={stockSearch}
      placeholder="Search stock..."
      onChange={(e) => {

        setStockSearch(
          e.target.value
        );

        setForm({
          ...form,
          symbol: e.target.value,
        });

      }}
      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
    />

  </label>

  {searchResults.length > 0 && (

    <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">

      {searchResults.map((stock) => (

        <button
          key={stock.id}
          type="button"
          onClick={() => {

            setForm({
              ...form,
              symbol: stock.symbol,
            });

            setStockSearch(
              stock.symbol
            );

            setSearchResults([]);

          }}
          className="block w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
        >

          <div className="font-semibold">
            {stock.symbol}
          </div>

          <div className="text-xs text-slate-500">
            {stock.companyName}
          </div>

        </button>

      ))}

    </div>

  )}

</div>

      <Input
        label="Quantity"
        name="quantity"
        type="number"
        value={form.quantity}
        onChange={handleChange}
        placeholder="Example: 5"
      />

      <Input
        label="Price"
        name="price"
        type="number"
        value={form.price}
        onChange={handleChange}
        placeholder="Example: 3500"
      />

      <Button
        type="submit"
        disabled={submitting}
        variant={isBuy ? "primary" : "danger"}
        className="w-full py-3 text-base"
      >
        {submitting ? "Processing..." : isBuy ? "Buy Stock" : "Sell Stock"}
      </Button>
    </form>
  );
}