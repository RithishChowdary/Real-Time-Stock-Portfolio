import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";

export default function StockForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    symbol: "",
    companyName: "",
    currentPrice: "",
  });

  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.symbol.trim() || !form.companyName.trim() || !form.currentPrice) {
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        symbol: form.symbol.trim().toUpperCase(),
        companyName: form.companyName.trim(),
        currentPrice: Number(form.currentPrice),
      });

      setForm({
        symbol: "",
        companyName: "",
        currentPrice: "",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Stock symbol"
        name="symbol"
        value={form.symbol}
        onChange={handleChange}
        placeholder="Example: TCS"
      />

      <Input
        label="Company name"
        name="companyName"
        value={form.companyName}
        onChange={handleChange}
        placeholder="Example: Tata Consultancy Services"
      />

      <Input
        label="Current price"
        name="currentPrice"
        type="number"
        value={form.currentPrice}
        onChange={handleChange}
        placeholder="Example: 3500"
      />

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Stock"}
        </Button>

        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}