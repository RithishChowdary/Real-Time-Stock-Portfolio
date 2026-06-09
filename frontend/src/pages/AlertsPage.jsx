import { useEffect, useState } from "react";
import AlertForm from "../components/alerts/AlertForm";
import AlertList from "../components/alerts/AlertList";
import Card from "../components/ui/Card";
import Loader from "../components/ui/Loader";
import { createAlert, getAlerts } from "../services/alertService";
import { getStocks } from "../services/stockService";
import { useRealtime } from "../hooks/useRealtime";

export default function AlertsPage() {
  const realtime = useRealtime();
  const [alerts, setAlerts] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [alertData, stockData] = await Promise.all([
        getAlerts(),
        getStocks(0, 100),
      ]);

      setAlerts(alertData);
      setStocks(stockData.content || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load alerts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (realtime?.latestAlert) {
      setAlerts((current) =>
        current.map((alert) =>
          alert.id === realtime.latestAlert.id ? realtime.latestAlert : alert
        )
      );
      setSuccess("A stock alert was triggered in real time.");
    }
  }, [realtime?.latestAlert]);

  async function handleCreate(payload) {
    setError("");
    setSuccess("");

    try {
      const created = await createAlert(payload);
      setAlerts((current) => [created, ...current]);
      setSuccess("Alert created successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create alert");
    }
  }

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <div className="border-b border-slate-200 dark:border-slate-800 pb-1.5">
    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
     Alerts
    </h1>
  </div>
        <p className="mt-1 text-sm text-slate-500">
          Create price alerts and receive realtime notifications.
        </p>
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

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Create Alert</h2>

          {!stocks.length ? (
            <p className="text-sm text-slate-500">
              No stocks found. Create stocks first as ADMIN.
            </p>
          ) : (
            //stocks={stocks}
            <AlertForm stocks={stocks} onSubmit={handleCreate} />
          )}
        </Card>

        <AlertList alerts={alerts} />
      </div>
    </div>
  );
}