import {
  ShieldAlert,
  Sparkles,
  RefreshCw,
  PieChart,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Percent,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { analyzePortfolioRisk } from "../../services/portfolioRiskService";
import { formatCurrency } from "../../utils/formatters";

export default function PortfolioRiskAnalysis() {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    setLoading(true);
    setError("");

    try {
      const data = await analyzePortfolioRisk();
      setAnalysisData(data);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes("API key")) {
        setError("AI analysis is currently unavailable. Please configure the GEMINI_API_KEY environment variable.");
      } else {
        setError(err.response?.data?.message || "Unable to complete portfolio risk analysis. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const metrics = analysisData?.metrics;
  const ai = analysisData?.aiAssessment;

  function getRiskBadge(level, score) {
    let colorClasses = "border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#3B82F6]";
    if (level === "LOW") {
      colorClasses = "border-[#00C896]/30 bg-[#00C896]/10 text-[#00C896]";
    } else if (level === "HIGH") {
      colorClasses = "border-amber-500/30 bg-amber-500/10 text-amber-400";
    } else if (level === "VERY HIGH") {
      colorClasses = "border-[#FF4D5A]/30 bg-[#FF4D5A]/10 text-[#FF4D5A]";
    }

    return (
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9AA1A9]">
            Risk Score
          </p>
          <p className="font-mono text-2xl font-bold text-[#F1F3F5]">
            {score} <span className="text-sm font-normal text-[#6F7780]">/ 100</span>
          </p>
        </div>
        <div className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider ${colorClasses}`}>
          {level} RISK
        </div>
      </div>
    );
  }

  return (
    <Card className="border border-slate-200 dark:border-[#2A2E32] bg-white dark:bg-[#181B1D]">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 border-b border-slate-200 dark:border-[#2A2E32] pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-[#3B82F6]/20 bg-[#3B82F6]/10 p-2 text-[#3B82F6]">
            <ShieldAlert size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-[#F1F3F5]">
                AI Portfolio Risk Analysis
              </h2>
              <span className="inline-flex items-center gap-1 rounded bg-[#3B82F6]/10 px-2 py-0.5 text-[10px] font-bold text-[#3B82F6] border border-[#3B82F6]/20">
                <Sparkles size={11} /> Gemini Grounded
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#9AA1A9]">
              Authoritative Java-calculated risk metrics interpreted by Gemini AI.
            </p>
          </div>
        </div>

        {analysisData && (
          <div className="flex items-center gap-3">
            {getRiskBadge(metrics.riskLevel, metrics.riskScore)}
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={handleAnalyze}
              className="h-10 px-3 text-xs font-semibold"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span>Re-analyze</span>
            </Button>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-xs text-red-300">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-400" />
          <div className="flex-1">
            <p className="font-semibold">Risk Analysis Notice</p>
            <p className="mt-0.5 text-red-300/90">{error}</p>
          </div>
        </div>
      )}

      {/* State 1: Initial CTA */}
      {!analysisData && !loading && (
        <div className="mt-5 flex flex-col items-center justify-between gap-5 rounded-xl border border-dashed border-slate-200 dark:border-[#2A2E32] bg-slate-50 dark:bg-[#141719] p-6 sm:flex-row sm:text-left">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F1F3F5]">
              Analyze Portfolio Concentration, Exposure & Downside Protection
            </h3>
            <p className="max-w-xl text-xs text-slate-500 dark:text-[#9AA1A9]">
              Evaluates current live holdings, single-stock concentration, cash liquidity buffer, and computes an authoritative platform risk score (0–100) paired with institutional Gemini AI interpretation.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={handleAnalyze}
            disabled={loading}
            className="h-11 whitespace-nowrap px-5 text-xs font-semibold"
          >
            <Sparkles size={15} />
            <span>Analyze Portfolio Risk</span>
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="mt-5 space-y-4 rounded-xl border border-slate-200 dark:border-[#2A2E32] bg-slate-50 dark:bg-[#141719] p-8 text-center">
          <div className="inline-flex rounded-full bg-[#3B82F6]/10 p-3 text-[#3B82F6] animate-pulse">
            <RefreshCw size={24} className="animate-spin" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F1F3F5]">
              Computing Authoritative Risk Metrics & Consulting Gemini AI...
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-[#9AA1A9]">
              Aggregating live positions, evaluating concentration weights, and generating grounded risk observations.
            </p>
          </div>
        </div>
      )}

      {/* State 2: Analysis Results */}
      {analysisData && !loading && (
        <div className="mt-5 space-y-6">
          {/* Section 1: Authoritative Backend Metrics */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#9AA1A9] flex items-center gap-1.5">
                <Percent size={13} className="text-[#3B82F6]" />
                <span>Authoritative Backend Metrics (Java Source of Truth)</span>
              </h3>
              <span className="font-mono text-[10px] text-slate-400 dark:text-[#6F7780]">
                Calculated: {new Date(metrics.calculatedAt).toLocaleTimeString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {/* Total Portfolio Value */}
              <div className="rounded-xl border border-slate-200 dark:border-[#2A2E32] bg-slate-50 dark:bg-[#141719] p-3">
                <p className="text-[11px] font-medium text-slate-500 dark:text-[#9AA1A9]">Total Portfolio</p>
                <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-[#F1F3F5]">
                  {formatCurrency(metrics.totalPortfolioValue)}
                </p>
              </div>

              {/* Holdings Value */}
              <div className="rounded-xl border border-slate-200 dark:border-[#2A2E32] bg-slate-50 dark:bg-[#141719] p-3">
                <p className="text-[11px] font-medium text-slate-500 dark:text-[#9AA1A9]">Holdings Value</p>
                <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-[#F1F3F5]">
                  {formatCurrency(metrics.holdingsValue)}
                </p>
              </div>

              {/* Available Cash */}
              <div className="rounded-xl border border-slate-200 dark:border-[#2A2E32] bg-slate-50 dark:bg-[#141719] p-3">
                <p className="text-[11px] font-medium text-slate-500 dark:text-[#9AA1A9]">Available Cash</p>
                <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-[#F1F3F5]">
                  {formatCurrency(metrics.availableCash)}
                </p>
              </div>

              {/* Total Invested */}
              <div className="rounded-xl border border-slate-200 dark:border-[#2A2E32] bg-slate-50 dark:bg-[#141719] p-3">
                <p className="text-[11px] font-medium text-slate-500 dark:text-[#9AA1A9]">Invested Cost</p>
                <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-[#F1F3F5]">
                  {formatCurrency(metrics.totalInvestment)}
                </p>
              </div>

              {/* Net Unrealized P&L */}
              <div className="rounded-xl border border-slate-200 dark:border-[#2A2E32] bg-slate-50 dark:bg-[#141719] p-3">
                <p className="text-[11px] font-medium text-slate-500 dark:text-[#9AA1A9]">Unrealized P&L</p>
                <div className="mt-1 flex items-center gap-1 font-mono text-sm font-bold">
                  {metrics.profitLoss >= 0 ? (
                    <span className="text-[#00C896]">
                      +{formatCurrency(metrics.profitLoss)}
                    </span>
                  ) : (
                    <span className="text-[#FF4D5A]">
                      {formatCurrency(metrics.profitLoss)}
                    </span>
                  )}
                  <span className={`text-[10px] ${metrics.returnPercentage >= 0 ? "text-[#00C896]" : "text-[#FF4D5A]"}`}>
                    ({metrics.returnPercentage >= 0 ? "+" : ""}{metrics.returnPercentage.toFixed(2)}%)
                  </span>
                </div>
              </div>

              {/* Cash Allocation % */}
              <div className="rounded-xl border border-slate-200 dark:border-[#2A2E32] bg-slate-50 dark:bg-[#141719] p-3">
                <p className="text-[11px] font-medium text-slate-500 dark:text-[#9AA1A9]">Cash Allocation</p>
                <p className="mt-1 font-mono text-sm font-bold text-[#3B82F6]">
                  {metrics.cashAllocationPercentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Portfolio Exposure & Concentration Breakdown */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Left 2 Cols: Position Exposures Table */}
            <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-[#2A2E32] bg-slate-50 dark:bg-[#141719] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#F1F3F5] flex items-center gap-1.5">
                  <PieChart size={14} className="text-[#3B82F6]" />
                  <span>Position Exposure Breakdown</span>
                </h4>
                <span className="text-xs text-slate-500 dark:text-[#9AA1A9]">
                  {metrics.numberOfHoldings} Active {metrics.numberOfHoldings === 1 ? "Position" : "Positions"}
                </span>
              </div>

              {metrics.positionExposures && metrics.positionExposures.length > 0 ? (
                <div className="space-y-3">
                  {metrics.positionExposures.map((pos) => (
                    <div
                      key={pos.symbol}
                      className="rounded-lg border border-slate-200 dark:border-[#2A2E32] bg-white dark:bg-[#181B1D] p-3 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-[#F1F3F5]">{pos.symbol}</span>
                          <span className="text-[11px] text-slate-500 dark:text-[#9AA1A9] truncate max-w-[140px] sm:max-w-none">
                            {pos.companyName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-right">
                          <span className="font-mono font-semibold text-slate-900 dark:text-[#F1F3F5]">
                            {formatCurrency(pos.currentValue)}
                          </span>
                          <span className="rounded bg-slate-100 dark:bg-[#1D2023] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#3B82F6]">
                            {pos.exposurePercentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Weight Progress Bar */}
                      <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-[#141719] overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pos.exposurePercentage > 40
                              ? "bg-amber-500"
                              : "bg-[#3B82F6]"
                          }`}
                          style={{ width: `${Math.min(100, Math.max(2, pos.exposurePercentage))}%` }}
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-[#9AA1A9] font-mono">
                        <span>
                          {pos.quantity} units @ ₹{pos.currentPrice}
                        </span>
                        <span className={pos.profitLoss >= 0 ? "text-[#00C896]" : "text-[#FF4D5A]"}>
                          P&L: {pos.profitLoss >= 0 ? "+" : ""}{formatCurrency(pos.profitLoss)} ({pos.returnPercentage >= 0 ? "+" : ""}{pos.returnPercentage.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 dark:border-[#2A2E32] p-6 text-center text-xs text-slate-500 dark:text-[#9AA1A9]">
                  <Wallet size={24} className="mx-auto text-slate-400 dark:text-[#6F7780] mb-2" />
                  <p className="font-semibold text-slate-700 dark:text-[#F1F3F5]">100% Cash / No Active Stock Positions</p>
                  <p className="mt-1">
                    Your paper trading portfolio is currently all cash. Execute paper trades from the Stocks page to analyze equity concentration and exposure risks.
                  </p>
                </div>
              )}
            </div>

            {/* Right 1 Col: Concentration Summary & Java Risk Factors */}
            <div className="space-y-4">
              {/* Largest Holding Card */}
              <div className="rounded-xl border border-slate-200 dark:border-[#2A2E32] bg-slate-50 dark:bg-[#141719] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#9AA1A9]">
                  Largest Position
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-slate-900 dark:text-[#F1F3F5]">
                      {metrics.largestHoldingSymbol}
                    </p>
                    <p className="font-mono text-xs text-slate-500 dark:text-[#9AA1A9]">
                      {formatCurrency(metrics.largestHoldingValue)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xl font-bold text-[#3B82F6]">
                      {metrics.largestHoldingPercentage.toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-[#6F7780]">Portfolio Weight</p>
                  </div>
                </div>
              </div>

              {/* Observed Risk Factors */}
              <div className="rounded-xl border border-slate-200 dark:border-[#2A2E32] bg-slate-50 dark:bg-[#141719] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#9AA1A9] mb-2">
                  Engine Observations
                </p>
                <ul className="space-y-2 text-xs">
                  {metrics.riskFactors && metrics.riskFactors.length > 0 ? (
                    metrics.riskFactors.map((factor, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-[#F1F3F5]">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3B82F6]" />
                        <span>{factor}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-400 dark:text-[#6F7780] italic">No specific risk alerts detected.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Gemini AI Risk Interpretation */}
          {ai && (
            <div className="rounded-xl border border-[#3B82F6]/20 bg-blue-50/50 dark:bg-[#141719] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2A2E32] pb-3">
                <div className="flex items-center gap-2 text-[#3B82F6] font-bold text-xs uppercase tracking-wider">
                  <Sparkles size={14} />
                  <span>Gemini AI Quantitative Risk Interpretation</span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-[#6F7780]">
                  Grounded in authoritative Java metrics
                </span>
              </div>

              {/* Executive Summary */}
              {ai.executiveSummary && (
                <div className="rounded-xl border border-[#3B82F6]/20 bg-blue-50 dark:bg-[#1D2023] p-3.5 text-xs">
                  <p className="font-semibold text-[#3B82F6] uppercase tracking-wide text-[11px] mb-1">
                    Executive Summary
                  </p>
                  <p className="text-slate-800 dark:text-[#F1F3F5] leading-relaxed">
                    {ai.executiveSummary}
                  </p>
                </div>
              )}

              {/* Risk & Exposure Analysis Grid */}
              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                {ai.riskAssessment && (
                  <div className="rounded-xl border border-slate-200 dark:border-[#2A2E32] bg-white dark:bg-[#181B1D] p-3.5">
                    <p className="font-semibold text-slate-900 dark:text-[#F1F3F5] mb-1">
                      Risk Score Evaluation
                    </p>
                    <p className="text-slate-600 dark:text-[#9AA1A9] leading-relaxed">
                      {ai.riskAssessment}
                    </p>
                  </div>
                )}

                {ai.exposureAnalysis && (
                  <div className="rounded-xl border border-slate-200 dark:border-[#2A2E32] bg-white dark:bg-[#181B1D] p-3.5">
                    <p className="font-semibold text-slate-900 dark:text-[#F1F3F5] mb-1">
                      Exposure & Liquidity Buffer
                    </p>
                    <p className="text-slate-600 dark:text-[#9AA1A9] leading-relaxed">
                      {ai.exposureAnalysis}
                    </p>
                  </div>
                )}
              </div>

              {/* Strengths & Areas of Concern Grid */}
              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                {/* Strengths */}
                <div className="rounded-xl border border-[#00C896]/20 bg-[#00C896]/5 dark:bg-[#00C896]/10 p-3.5">
                  <div className="flex items-center gap-1.5 font-semibold text-[#00C896] mb-2">
                    <CheckCircle2 size={14} />
                    <span>Portfolio Strengths</span>
                  </div>
                  <ul className="space-y-1.5">
                    {ai.strengths && ai.strengths.length > 0 ? (
                      ai.strengths.map((s, idx) => (
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

                {/* Areas of Concern */}
                <div className="rounded-xl border border-[#FF4D5A]/20 bg-[#FF4D5A]/5 dark:bg-[#FF4D5A]/10 p-3.5">
                  <div className="flex items-center gap-1.5 font-semibold text-[#FF4D5A] mb-2">
                    <XCircle size={14} />
                    <span>Areas of Concern / Vulnerabilities</span>
                  </div>
                  <ul className="space-y-1.5">
                    {ai.areasOfConcern && ai.areasOfConcern.length > 0 ? (
                      ai.areasOfConcern.map((c, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-slate-700 dark:text-[#F1F3F5]">
                          <span className="text-[#FF4D5A] font-bold">•</span>
                          <span>{c}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400 dark:text-[#6F7780] italic">None noted</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Recommended Review Areas */}
              {ai.recommendedReviewAreas && ai.recommendedReviewAreas.length > 0 && (
                <div className="rounded-xl border border-slate-200 dark:border-[#2A2E32] bg-white dark:bg-[#181B1D] p-3.5 text-xs">
                  <p className="font-semibold text-slate-900 dark:text-[#F1F3F5] mb-2">
                    Recommended Areas to Review
                  </p>
                  <ul className="space-y-1.5">
                    {ai.recommendedReviewAreas.map((area, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-[#F1F3F5]">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3B82F6]" />
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-right text-[10px] text-slate-400 dark:text-[#6F7780] italic">
                {ai.educationalDisclaimer || "Educational portfolio risk interpretation only. Grounded strictly in Java-calculated metrics. Not personalized financial advice."}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
