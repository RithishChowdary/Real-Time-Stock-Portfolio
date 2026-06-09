import Card from "../ui/Card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function DashboardChart({ summary }) {
  const data = [
    {
      name: "Invested",
      value: Number(summary?.totalInvestment || 0),
    },
    {
      name: "Current",
      value: Number(summary?.currentValue || 0),
    },
    {
      name: "Profit",
      value: Number(summary?.totalProfitLoss || 0),
    },
  ];

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Portfolio Performance
        </h2>

        <p className="text-sm text-slate-500">
          Investment vs current value
        </p>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#2563eb"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-200 pt-4 dark:border-slate-800">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Invested
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
            {data[0].value > 0 ? `₹${(data[0].value).toLocaleString('en-IN', {maximumFractionDigits: 0})}` : "₹0"}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Current Value
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
            {data[1].value > 0 ? `₹${(data[1].value).toLocaleString('en-IN', {maximumFractionDigits: 0})}` : "₹0"}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Profit/Loss
          </p>
          <p className={`mt-2 text-lg font-semibold ${
            data[2].value >= 0
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}>
            {data[2].value > 0 ? "+" : ""}{data[2].value > 0 ? `₹${(data[2].value).toLocaleString('en-IN', {maximumFractionDigits: 0})}` : `-₹${Math.abs(data[2].value).toLocaleString('en-IN', {maximumFractionDigits: 0})}`}
          </p>
        </div>
      </div>
    </Card>
  );
}