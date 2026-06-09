import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import { formatCurrency } from "../../utils/formatters";

export default function AlertList({ alerts }) {
  if (!alerts?.length) {
    return (
      <EmptyState
        title="No alerts yet"
        message="Create a price alert to get notified when a stock crosses your target."
      />
    );
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">Your Alerts</h2>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="rounded-lg border border-slate-200 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">Alert #{alert.id}</p>
              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                  alert.active
                    ? "bg-green-50 text-green-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {alert.active ? "Active" : "Triggered"}
              </span>
            </div>

            <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <p>Target: {alert.targetPrice ? formatCurrency(alert.targetPrice) : "-"}</p>
              <p>Stop Loss: {alert.stopLoss ? formatCurrency(alert.stopLoss) : "-"}</p>
              <p>Profit %: {alert.profitPercentage ?? "-"}</p>
              <p>Loss %: {alert.lossPercentage ?? "-"}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}