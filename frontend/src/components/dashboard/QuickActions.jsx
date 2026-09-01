import {
  ShoppingCart,
  TrendingDown,
  BellRing,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Buy Stock",
      subtitle: "Execute simulated purchase",
      icon: ShoppingCart,
      color:
        "border-blue-500/30 bg-blue-500/10 text-blue-400 hover:border-blue-500/60 hover:bg-blue-500/20",
      onClick: () => navigate("/transactions?mode=buy"),
    },
    {
      label: "Sell Stock",
      subtitle: "Liquidate open holdings",
      icon: TrendingDown,
      color:
        "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:border-rose-500/60 hover:bg-rose-500/20",
      onClick: () => navigate("/transactions?mode=sell"),
    },
    {
      label: "Create Alert",
      subtitle: "Set custom price triggers",
      icon: BellRing,
      color:
        "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:border-amber-500/60 hover:bg-amber-500/20",
      onClick: () => navigate("/alerts"),
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <button
            key={action.label}
            onClick={action.onClick}
            className={`
              group
              ${action.color}
              cursor-pointer
              rounded-xl
              border
              p-3.5
              text-left
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:shadow-md
              active:scale-[0.99]
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-slate-900/50 p-2 border border-slate-800">
                  <Icon size={18} strokeWidth={2} />
                </div>

                <div>
                  <span className="font-semibold text-sm block text-slate-100">
                    {action.label}
                  </span>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    {action.subtitle}
                  </span>
                </div>
              </div>

              <span className="text-sm font-bold text-slate-400 opacity-60 transition-transform duration-200 group-hover:translate-x-1 group-hover:opacity-100">
                →
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}