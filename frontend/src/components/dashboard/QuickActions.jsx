import {
  ShoppingCart,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Buy Stock",
      icon: ShoppingCart,
      color:
        "bg-blue-500/5 border-blue-400/40 text-blue-400 hover:border-blue-400 hover:bg-blue-500/10",
      onClick: () => navigate("/transactions?mode=buy"),
    },
    {
      label: "Sell Stock",
      icon: TrendingDown,
      color:
        "bg-red-500/5 border-red-400/40 text-red-400 hover:border-red-400 hover:bg-red-500/10",
      onClick: () => navigate("/transactions?mode=sell"),
    },
    {
      label: "Create Alert",
      icon: AlertCircle,
      color:
        "bg-amber-500/5 border-amber-400/40 text-amber-400 hover:border-amber-400 hover:bg-amber-500/10",
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
              p-4
              transition-all
              duration-300
              hover:-translate-y-1
              hover:shadow-md
              active:scale-95
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon size={20} />

                <span className="font-semibold text-base">
                  {action.label}
                </span>
              </div>

              <span
                className="
                  text-lg
                  font-bold
                  opacity-0
                  transition-all
                  duration-300
                  group-hover:translate-x-1
                  group-hover:opacity-100
                "
              >
                →
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}