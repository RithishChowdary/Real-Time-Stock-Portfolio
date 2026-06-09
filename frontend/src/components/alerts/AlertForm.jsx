import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";

export default function AlertForm({ stocks, onSubmit }) {
  const [form, setForm] = useState({
    stockId: "",
    targetPrice: "",
    stopLoss: "",
    profitPercentage: "",
    lossPercentage: "",
  });

  useEffect(() => {
    if (stocks.length && !form.stockId) {
      setForm((current) => ({
        ...current,
        stockId: stocks[0].id,
      }));
    }
  }, [stocks, form.stockId]);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

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
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          Stock
        </span>
        <select
          name="stockId"
          value={form.stockId}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        >
          {stocks.map((stock) => (
            <option key={stock.id} value={stock.id}>
              {stock.symbol} - {stock.companyName}
            </option>
          ))}
        </select>
      </label>

      <Input label="Target price" name="targetPrice" type="number" value={form.targetPrice} onChange={handleChange} placeholder="Example: 4000" />
      <Input label="Stop loss" name="stopLoss" type="number" value={form.stopLoss} onChange={handleChange} placeholder="Example: 3000" />
      <Input label="Profit percentage" name="profitPercentage" type="number" value={form.profitPercentage} onChange={handleChange} placeholder="Optional" />
      <Input label="Loss percentage" name="lossPercentage" type="number" value={form.lossPercentage} onChange={handleChange} placeholder="Optional" />

      <Button type="submit" className="w-full">
        Create Alert
      </Button>
    </form>
  );
}