import { Sparkles, Bot, ShieldAlert, CheckCircle2, XCircle, TrendingUp, AlertTriangle, RefreshCw } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";

export default function AIAnalysisPanel({
  hasResults = false,
  onAnalyze,
  loading = false,
  analysis = null,
  error = "",
}) {
  return (
    <Card className="border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                AI Quantitative Analysis
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Institutional-grade interpretation of authoritative TA4J backtest metrics.
              </p>
            </div>
          </div>

          {analysis && (
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={onAnalyze}
              className="py-1.5 px-3 text-xs"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              Re-analyze
            </Button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* State 1: No Analysis Generated Yet */}
      {!analysis && (
        <div className="mt-4 flex flex-col items-center justify-between gap-4 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/30 sm:flex-row sm:text-left">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Deep Strategy Performance Explanation
            </h3>
            <p className="mt-1 max-w-xl text-xs text-slate-500 dark:text-slate-400">
              {hasResults
                ? "Generate a comprehensive analysis of win rate stability, profit factor sustainability, drawdown risks, and market regime conditions based on your backtest metrics."
                : "Run a quantitative backtest first to generate authoritative performance metrics for AI analysis."}
            </p>
          </div>

          <Button
            type="button"
            disabled={!hasResults || loading}
            onClick={onAnalyze}
            className="whitespace-nowrap py-2.5 px-4 text-xs font-semibold shadow-sm"
          >
            <Sparkles size={14} className={loading ? "animate-spin" : ""} />
            {loading
              ? "Analyzing quantitative results..."
              : hasResults
              ? "Analyze with AI"
              : "Run Backtest First"}
          </Button>
        </div>
      )}

      {/* State 2: Analysis Results Display */}
      {analysis && (
        <div className="mt-4 space-y-5 text-xs text-slate-700 dark:text-slate-300">
          {/* Executive Summary */}
          <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
              Executive Summary
            </h3>
            <p className="mt-1.5 text-sm font-medium text-slate-900 dark:text-slate-100">
              {analysis.summary}
            </p>
          </div>

          {/* Performance Analysis */}
          {analysis.performanceAnalysis && (
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Performance & Execution Breakdown
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {analysis.performanceAnalysis}
              </p>
            </div>
          )}

          {/* Strengths & Weaknesses Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Strengths */}
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/30 p-3.5 dark:border-emerald-950/40 dark:bg-emerald-950/10">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                <CheckCircle2 size={14} />
                <span>Strategy Strengths</span>
              </div>
              <ul className="mt-2 space-y-1.5">
                {analysis.strengths && analysis.strengths.length > 0 ? (
                  analysis.strengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">None noted</li>
                )}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="rounded-lg border border-rose-100 bg-rose-50/30 p-3.5 dark:border-rose-950/40 dark:bg-rose-950/10">
              <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-semibold">
                <XCircle size={14} />
                <span>Areas of Concern / Weaknesses</span>
              </div>
              <ul className="mt-2 space-y-1.5">
                {analysis.weaknesses && analysis.weaknesses.length > 0 ? (
                  analysis.weaknesses.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{w}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">None noted</li>
                )}
              </ul>
            </div>
          </div>

          {/* Risk Observations & Market Behavior */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Risk Observations */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/30">
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold">
                <ShieldAlert size={14} />
                <span>Risk Observations</span>
              </div>
              <ul className="mt-2 space-y-1.5">
                {analysis.riskObservations && analysis.riskObservations.length > 0 ? (
                  analysis.riskObservations.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">Standard parameters observed</li>
                )}
              </ul>
            </div>

            {/* Market Behavior */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/30">
              <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-semibold">
                <TrendingUp size={14} />
                <span>Market Regime Suitability</span>
              </div>
              <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-400">
                {analysis.marketBehavior || "Compatible with trending asset conditions."}
              </p>
            </div>
          </div>

          {/* Actionable Interpretation */}
          {analysis.interpretation && (
            <div className="rounded-lg border border-slate-200 bg-slate-100/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="font-semibold text-slate-900 dark:text-white">
                Quantitative Takeaway:
              </span>{" "}
              <span className="text-slate-700 dark:text-slate-300">
                {analysis.interpretation}
              </span>
            </div>
          )}

          {/* Generation Timestamp */}
          {analysis.generatedAt && (
            <p className="text-right text-[10px] text-slate-400">
              Analysis generated: {new Date(analysis.generatedAt).toLocaleTimeString()} · Grounded in TA4J quantitative metrics
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
