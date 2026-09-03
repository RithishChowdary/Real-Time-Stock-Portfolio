import { Sparkles, ShieldAlert, CheckCircle2, XCircle, TrendingUp, AlertTriangle, RefreshCw } from "lucide-react";
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
    <Card className="border border-slate-200 dark:border-[#2A2E32] bg-white dark:bg-[#181B1D]">
      {/* Header */}
      <div className="border-b border-slate-200 pb-3 dark:border-[#2A2E32]">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[#3B82F6]/10 p-2 text-[#3B82F6] border border-[#3B82F6]/20">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-[#F1F3F5]">
                AI Quantitative Analysis
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#9AA1A9]">
                Institutional-grade interpretation of authoritative TA4J backtest metrics.
              </p>
            </div>
          </div>

          {analysis && (
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={onAnalyze}
              className="py-1.5 px-3 text-xs"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              <span>Re-analyze</span>
            </Button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* State 1: No Analysis Generated Yet */}
      {!analysis && (
        <div className="mt-4 flex flex-col items-center justify-between gap-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 dark:border-[#2A2E32] dark:bg-[#141719] p-6 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-[#F1F3F5]">
              Deep Strategy Performance Explanation
            </h3>
            <p className="mt-1 max-w-xl text-xs text-slate-500 dark:text-[#9AA1A9]">
              {hasResults
                ? "Generate a comprehensive analysis of win rate stability, profit factor sustainability, drawdown risks, and market regime conditions based on your backtest metrics."
                : "Run a quantitative backtest first to generate authoritative performance metrics for AI analysis."}
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            disabled={!hasResults || loading}
            onClick={onAnalyze}
            className="whitespace-nowrap py-2.5 px-4 text-xs font-semibold"
          >
            <Sparkles size={14} className={loading ? "animate-spin" : ""} />
            {loading
              ? "Analyzing..."
              : hasResults
              ? "Analyze with AI"
              : "Run Backtest First"}
          </Button>
        </div>
      )}

      {/* State 2: Analysis Results Display */}
      {analysis && (
        <div className="mt-4 space-y-4 text-xs text-slate-700 dark:text-[#F1F3F5]">
          {/* Executive Summary */}
          <div className="rounded-xl border border-[#3B82F6]/20 bg-blue-50/50 p-4 dark:border-[#3B82F6]/30 dark:bg-[#1D2023]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#3B82F6]">
              Executive Summary
            </h3>
            <p className="mt-1.5 text-sm font-medium text-slate-900 dark:text-[#F1F3F5] leading-relaxed">
              {analysis.summary}
            </p>
          </div>

          {/* Performance Analysis */}
          {analysis.performanceAnalysis && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-[#2A2E32] dark:bg-[#141719]">
              <h3 className="font-semibold text-slate-900 dark:text-[#F1F3F5]">
                Performance & Execution Breakdown
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-[#9AA1A9]">
                {analysis.performanceAnalysis}
              </p>
            </div>
          )}

          {/* Strengths & Weaknesses Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Strengths */}
            <div className="rounded-xl border border-[#00C896]/20 bg-[#00C896]/5 p-3.5 dark:border-[#00C896]/20 dark:bg-[#00C896]/10">
              <div className="flex items-center gap-1.5 text-[#00C896] font-semibold">
                <CheckCircle2 size={14} />
                <span>Strategy Strengths</span>
              </div>
              <ul className="mt-2 space-y-1.5">
                {analysis.strengths && analysis.strengths.length > 0 ? (
                  analysis.strengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-slate-700 dark:text-[#F1F3F5]">
                      <span className="text-[#00C896] font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 dark:text-[#6F7780] italic">None noted</li>
                )}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="rounded-xl border border-[#FF4D5A]/20 bg-[#FF4D5A]/5 p-3.5 dark:border-[#FF4D5A]/20 dark:bg-[#FF4D5A]/10">
              <div className="flex items-center gap-1.5 text-[#FF4D5A] font-semibold">
                <XCircle size={14} />
                <span>Areas of Concern / Weaknesses</span>
              </div>
              <ul className="mt-2 space-y-1.5">
                {analysis.weaknesses && analysis.weaknesses.length > 0 ? (
                  analysis.weaknesses.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-slate-700 dark:text-[#F1F3F5]">
                      <span className="text-[#FF4D5A] font-bold">•</span>
                      <span>{w}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 dark:text-[#6F7780] italic">None noted</li>
                )}
              </ul>
            </div>
          </div>

          {/* Risk Observations & Market Behavior */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Risk Observations */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-[#2A2E32] dark:bg-[#141719]">
              <div className="flex items-center gap-1.5 text-amber-500 font-semibold">
                <ShieldAlert size={14} />
                <span>Risk Observations</span>
              </div>
              <ul className="mt-2 space-y-1.5">
                {analysis.riskObservations && analysis.riskObservations.length > 0 ? (
                  analysis.riskObservations.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-slate-700 dark:text-[#F1F3F5]">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 dark:text-[#6F7780] italic">Standard parameters observed</li>
                )}
              </ul>
            </div>

            {/* Market Behavior */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-[#2A2E32] dark:bg-[#141719]">
              <div className="flex items-center gap-1.5 text-[#3B82F6] font-semibold">
                <TrendingUp size={14} />
                <span>Market Regime Suitability</span>
              </div>
              <p className="mt-2 leading-relaxed text-slate-600 dark:text-[#9AA1A9]">
                {analysis.marketBehavior || "Compatible with trending asset conditions."}
              </p>
            </div>
          </div>

          {/* Actionable Interpretation */}
          {analysis.interpretation && (
            <div className="rounded-xl border border-slate-200 bg-slate-100 p-3.5 dark:border-[#2A2E32] dark:bg-[#1D2023]">
              <span className="font-semibold text-slate-900 dark:text-[#F1F3F5]">
                Quantitative Takeaway:
              </span>{" "}
              <span className="text-slate-700 dark:text-[#9AA1A9]">
                {analysis.interpretation}
              </span>
            </div>
          )}

          {/* Generation Timestamp */}
          {analysis.generatedAt && (
            <p className="text-right text-[10px] text-slate-400 dark:text-[#6F7780]">
              Analysis generated: {new Date(analysis.generatedAt).toLocaleTimeString()} · Grounded in TA4J quantitative metrics
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
