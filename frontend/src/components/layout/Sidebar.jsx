import {
  BarChart3,
  Bell,
  Briefcase,
  LineChart,
  Repeat,
  Wallet,
  FileText,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/portfolios", label: "Portfolios", icon: Briefcase },
  { to: "/stocks", label: "Stocks", icon: LineChart },
  { to: "/transactions", label: "Transactions", icon: Repeat },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/notifications", label: "Notifications", icon: Bell },

  {
  to: "/admin/research",
  label: "Research",
  icon: FileText,
},
];

export default function Sidebar({ open = false, onClose }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950 lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Wallet size={18} />
          </div>

          <div>
            <h1 className="text-sm font-semibold text-slate-900 dark:text-white">
              InvestIND
            </h1>

            <p className="text-xs text-slate-500">
              Real-Time Stock Analytics
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <div className="px-3 py-4">
        <nav className="space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}