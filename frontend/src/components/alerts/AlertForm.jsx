import { useEffect, useState, useMemo } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { formatCurrency } from "../../utils/formatters";
import { AlertCircle, BellRing } from "lucide-react";

export default function AlertForm({ stocks = [], onSubmit }) {
  const [form, setForm] = useState({
    stockId: "",
    targetPrice: "",
    stopLoss: "",
    profitPercentage: "",
    lossPercentage: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (stocks.length && !form.stockId) {
      setForm((current) => ({
        ...current,
        stockId: stocks[0].id,
      }));
    }
  }, [stocks, form.stockId]);

  const selectedStock = useMemo(() => {
    return stocks.find((s) => String(s.id) === String(form.stockId)) || null;
  }, [stocks, form.stockId]);

  function handleChange(event) {
    setLocalError("");
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  // Client-side validation
  const validationError = useMemo(() => {
    if (!form.stockId) return "Please select a stock.";

    const hasAnyField =
      form.targetPrice !== "" ||
      form.stopLoss !== "" ||
      form.profitPercentage !== "" ||
      form.lossPercentage !== "";

    if (!hasAnyField) {
      return "Specify at least one alert condition (target price, stop loss, profit %, or loss %).";
    }

    if (form.targetPrice !== "") {
      const tp = Number(form.targetPrice);
      if (isNaN(tp) || tp <= 0) return "Target price must be greater than ₹0.00.";
    }

    if (form.stopLoss !== "") {
      const sl = Number(form.stopLoss);
      if (isNaN(sl) || sl <= 0) return "Stop loss must be greater than ₹0.00.";
    }

    if (form.profitPercentage !== "") {
      const pp = Number(form.profitPercentage);
      if (isNaN(pp) || pp <= 0) return "Profit target percentage must be greater than 0%.";
    }

    if (form.lossPercentage !== "") {
      const lp = Number(form.lossPercentage);
      if (isNaN(lp) || lp <= 0) return "Loss limit percentage must be greater than 0%.";
    }

    return null;
  }, [form]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLocalError("");

    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        stockId: Number(form.stockId),
        targetPrice: form.targetPrice ? Number(form.targetPrice) : null,
        stopLoss: form.stopLoss ? Number(form.stopLoss) : null,
        profitPercentage: form.profitPercentage ? Number(form.profitPercentage) : null,
        lossPercentage: form.lossPercentage ? Number(form.lossPercentage) : null,
      });

      setForm((current) => ({
        ...current,
        targetPrice: "",
        stopLoss: "",
        profitPercentage: "",
        lossPercentage: "",
      }));
    } catch (err) {
      setLocalError(err.response?.data?.message || err.message || "Failed to create alert");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Stock Selection */}
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Stock
        </span>
        <select
          name="stockId"
          value={form.stockId}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-500"
        >
          {stocks.map((stock) => (
            <option key={stock.id} value={stock.id}>
              {stock.symbol} — {stock.companyName}
            </option>
          ))}
        </select>
      </label>

      {/* Selected Stock Live Market Price */}
      {selectedStock && (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/40">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {selectedStock.symbol}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {selectedStock.companyName}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-500">Current Market Price</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {formatCurrency(selectedStock.currentPrice)}
            </p>
          </div>
        </div>
      )}

      {/* Target Price & Stop Loss */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Target Price (₹)"
          name="targetPrice"
          type="number"
          min="0.01"
          step="any"
          value={form.targetPrice}
          onChange={handleChange}
          placeholder="e.g. 4000"
        />

        <Input
          label="Stop Loss (₹)"
          name="stopLoss"
          type="number"
          min="0.01"
          step="any"
          value={form.stopLoss}
          onChange={handleChange}
          placeholder="e.g. 3000"
        />
      </div>

      {/* Profit % & Loss % */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Profit Target %"
          name="profitPercentage"
          type="number"
          min="0.01"
          step="any"
          value={form.profitPercentage}
          onChange={handleChange}
          placeholder="e.g. 5.0"
        />

        <Input
          label="Loss Limit %"
          name="lossPercentage"
          type="number"
          min="0.01"
          step="any"
          value={form.lossPercentage}
          onChange={handleChange}
          placeholder="e.g. 2.5"
        />
      </div>

      <p className="text-[11px] text-slate-400 dark:text-slate-500">
        * Set at least one condition. Values must be strictly positive.
      </p>

      {/* Error alert */}
      {(localError || (validationError && form.stockId)) && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{localError || validationError}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={submitting || Boolean(validationError)}
        className="w-full py-2.5 text-sm font-bold shadow-sm"
      >
        <BellRing size={16} />
        {submitting ? "Creating Alert..." : "Create Alert"}
      </Button>
    </form>
  );
}