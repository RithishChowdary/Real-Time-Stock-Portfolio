import { FlaskConical, Cpu } from "lucide-react";

export default function StrategyLabHeader() {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Quantitative Research Engine
          </p>
          <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            <Cpu size={11} /> TA4J Native
          </span>
        </div>

        <div className="mt-1 border-b border-slate-200 dark:border-slate-800 pb-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Strategy Lab
          </h1>
        </div>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Quantitative strategy research, historical backtesting, and walk-forward optimization.
        </p>
      </div>
    </div>
  );
}
