import { useEffect, useState } from "react";
import {
  FileText,
  UploadCloud,
  Trash2,
  ExternalLink,
  Download,
  AlertTriangle,
  CheckCircle2,
  Search,
  RefreshCw,
  ShieldCheck,
  Building,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader";
import { searchStocks } from "../services/stockService";
import {
  getAllResearch,
  uploadResearch,
  deleteResearch,
  getResearchDownloadUrl,
} from "../services/adminResearchService";
import { formatDateTime } from "../utils/formatters";

export default function ResearchManagementPage() {
  const [researchList, setResearchList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockSearch, setStockSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [pdfFile, setPdfFile] = useState(null);

  async function loadResearchReports() {
    setLoading(true);
    setError("");
    try {
      const data = await getAllResearch();
      setResearchList(data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load research reports. Please check administrative permissions."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResearchReports();
  }, []);

  // Debounced stock search
  useEffect(() => {
    if (!stockSearch || stockSearch.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    if (selectedStock && stockSearch.toUpperCase() === selectedStock.symbol.toUpperCase()) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchStocks(stockSearch.trim());
        setSearchResults(results.slice(0, 5));
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [stockSearch, selectedStock]);

  function handleSelectStock(stock) {
    setSelectedStock(stock);
    setStockSearch(stock.symbol);
    setSearchResults([]);
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setError("Please select a valid PDF document (.pdf).");
      setPdfFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit. Please upload a smaller PDF.");
      setPdfFile(null);
      return;
    }

    setError("");
    setPdfFile(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedStock || !selectedStock.id) {
      setError("Please select a target stock for the research report.");
      return;
    }

    if (!title.trim()) {
      setError("Please provide a research title.");
      return;
    }

    if (!pdfFile) {
      setError("Please attach a research PDF document.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        stockId: selectedStock.id,
        title: title.trim(),
        summary: summary.trim(),
        sourceUrl: sourceUrl.trim(),
      };

      const created = await uploadResearch(payload, pdfFile);
      setResearchList((prev) => [created, ...prev]);

      setSuccess(`Research report "${created.title}" uploaded successfully.`);

      // Reset form
      setSelectedStock(null);
      setStockSearch("");
      setTitle("");
      setSummary("");
      setSourceUrl("");
      setPdfFile(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to upload research report. Please verify permissions and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(report) {
    const confirmed = window.confirm(
      `Are you sure you want to delete the research report: "${report.title}"?`
    );
    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deleteResearch(report.id);
      setResearchList((prev) => prev.filter((r) => r.id !== report.id));
      setSuccess(`Research report deleted successfully.`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to delete research report. Admin privileges required."
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Research Management
            </h1>
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
              <ShieldCheck size={12} /> Admin Only
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Publish institutional research notes, fundamental analyses, and PDF filings for stocks.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={loadResearchReports}
          disabled={loading}
          className="text-xs"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh Reports
        </Button>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          <AlertTriangle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-700 dark:border-emerald-950/50 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Grid: Upload Form + Uploaded Table */}
      <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
        {/* Upload Form Card */}
        <Card className="border border-slate-200 dark:border-slate-800">
          <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <UploadCloud size={16} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Publish Research
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload PDF reports with structured metadata.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Stock Search Input */}
            <div className="relative space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Target Stock <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search stock symbol or name (e.g. TCS)..."
                  value={stockSearch}
                  onChange={(e) => {
                    setStockSearch(e.target.value);
                    if (selectedStock && e.target.value !== selectedStock.symbol) {
                      setSelectedStock(null);
                    }
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              {/* Autocomplete Dropdown */}
              {searchResults.length > 0 && !selectedStock && (
                <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                  {searchResults.map((stock) => (
                    <button
                      key={stock.id}
                      type="button"
                      onClick={() => handleSelectStock(stock)}
                      className="flex w-full items-center justify-between rounded-md p-2 text-left text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {stock.symbol}
                      </span>
                      <span className="truncate text-slate-500 dark:text-slate-400">
                        {stock.companyName}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {selectedStock && (
                <div className="mt-1 flex items-center justify-between rounded-md bg-blue-50 px-2.5 py-1 text-xs text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                  <span>Selected: <strong>{selectedStock.symbol}</strong> ({selectedStock.companyName})</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStock(null);
                      setStockSearch("");
                    }}
                    className="text-[11px] font-semibold underline hover:text-blue-900"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Research Title */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Research Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Q3 Financial Performance & Cloud Growth Analysis"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            {/* Summary */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Executive Summary
              </label>
              <textarea
                rows={3}
                placeholder="Key takeaways, target valuation, or fundamental catalysts..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            {/* Source URL */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Source Reference URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            {/* File Upload */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Research PDF Document <span className="text-rose-500">*</span>
              </label>
              <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center dark:border-slate-700">
                <FileText size={24} className="mx-auto text-slate-400" />
                <label className="mt-2 block cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-700">
                  <span>{pdfFile ? pdfFile.name : "Choose PDF Document"}</span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="mt-1 text-[11px] text-slate-400">
                  {pdfFile
                    ? `${(pdfFile.size / (1024 * 1024)).toFixed(2)} MB`
                    : "Maximum file size 10MB (.pdf only)"}
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting || !selectedStock || !title.trim() || !pdfFile}
              className="w-full py-2.5 text-xs font-semibold"
            >
              {submitting ? "Uploading Research..." : "Upload Research Report"}
            </Button>
          </form>
        </Card>

        {/* Uploaded Reports Table */}
        <Card className="border border-slate-200 dark:border-slate-800">
          <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Uploaded Reports
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {researchList.length} total institutional research documents.
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8">
              <Loader />
            </div>
          ) : researchList.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <FileText size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">
                No research reports available.
              </p>
              <p className="mt-1 text-slate-400">
                Upload your first institutional research document using the form.
              </p>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                    <th className="py-2.5 font-semibold uppercase tracking-wider">Stock</th>
                    <th className="py-2.5 font-semibold uppercase tracking-wider">Title & Summary</th>
                    <th className="py-2.5 font-semibold uppercase tracking-wider">Published</th>
                    <th className="py-2.5 font-semibold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {researchList.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="py-3 font-semibold text-slate-900 dark:text-white align-top">
                        <span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                          {report.stockSymbol}
                        </span>
                      </td>

                      <td className="py-3 align-top">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {report.title}
                        </p>
                        {report.summary && (
                          <p className="mt-1 max-w-md text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {report.summary}
                          </p>
                        )}
                        {report.sourceUrl && (
                          <a
                            href={report.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                          >
                            <ExternalLink size={11} /> Source Reference
                          </a>
                        )}
                      </td>

                      <td className="py-3 text-slate-500 dark:text-slate-400 align-top whitespace-nowrap">
                        {formatDateTime(report.createdAt)}
                      </td>

                      <td className="py-3 text-right align-top whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={getResearchDownloadUrl(report.pdfUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          >
                            <Download size={12} /> View PDF
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDelete(report)}
                            className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/60"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}