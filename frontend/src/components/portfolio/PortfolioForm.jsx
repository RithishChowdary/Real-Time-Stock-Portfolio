import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";

export default function PortfolioForm({ initialName = "", submitLabel = "Save", onSubmit, onCancel }) {
  const [portfolioName, setPortfolioName] = useState(initialName);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!portfolioName.trim()) return;

    setSubmitting(true);

    try {
      await onSubmit({ portfolioName: portfolioName.trim() });
      setPortfolioName("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Portfolio name"
        name="portfolioName"
        value={portfolioName}
        onChange={(event) => setPortfolioName(event.target.value)}
        placeholder="Example: Long Term Portfolio"
      />

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : submitLabel}
        </Button>

        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}