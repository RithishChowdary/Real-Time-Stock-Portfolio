import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  FlaskConical,
  Sparkles,
  Bell,
  Wallet,
  FileText,
  ShieldCheck,
  TrendingUp,
  Headphones,
} from "lucide-react";
import logo from "../assets/logo.png";

// Top marquee ticker items (Preserved exactly)
const tickerItems = [
  ["NIFTY 50", "22,812.30", "+0.85%"],
  ["SENSEX", "74,910.40", "+0.62%"],
  ["BANKNIFTY", "48,252.15", "-0.18%"],
  ["TCS", "3,842.10", "+1.24%"],
  ["INFY", "1,648.50", "+0.60%"],
  ["GOKEX", "692.58", "+1.32%"],
  ["HCLTECH", "1,246.60", "+2.57%"],
  ["SBIN", "1,193.82", "+0.50%"],
];

// Initial baseline intraday time series for hero chart
const initialTimeSeries = [
  { time: "09:30", val: 128972 },
  { time: "10:00", val: 129450 },
  { time: "10:30", val: 129180 },
  { time: "11:00", val: 130220 },
  { time: "11:30", val: 131050 },
  { time: "12:00", val: 130780 },
  { time: "12:30", val: 131900 },
  { time: "13:00", val: 132450 },
  { time: "13:30", val: 132100 },
  { time: "14:00", val: 133200 },
  { time: "14:30", val: 133750 },
  { time: "15:00", val: 134030 },
];

const initialStockCards = [
  { symbol: "TCS", name: "Tata Consultancy Services", price: 3842.10, change: "+1.24%", isPos: true },
  { symbol: "INFY", name: "Infosys Limited", price: 1648.50, change: "+0.60%", isPos: true },
  { symbol: "RELIANCE", name: "Reliance Industries", price: 2965.00, change: "+1.18%", isPos: true },
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd", price: 1535.00, change: "-0.42%", isPos: false },
];

const features = [
  {
    icon: LineChart,
    title: "Live Portfolio Analytics",
    text: "Track holdings, returns, market valuation, profit/loss, and cash balances in one focused dashboard.",
  },
  {
    icon: FlaskConical,
    title: "Quantitative Strategy Lab",
    text: "Backtest EMA + RSI and EMA Crossover strategies against historical market data with full TA4J metrics.",
  },
  {
    icon: Sparkles,
    title: "AI Quantitative Analysis",
    text: "Grounded AI interpretation of real backtest trade statistics, risk factors, and market regime suitability.",
  },
  {
    icon: Bell,
    title: "Real-Time Price Alerts",
    text: "Set target price, stop-loss, and percentage gain/loss alerts with immediate notification delivery.",
  },
  {
    icon: Wallet,
    title: "Paper-Trading Engine",
    text: "Simulated ₹1,00,000 initial capital with pessimistic locking for atomic, zero-discrepancy buy/sell transactions.",
  },
  {
    icon: FileText,
    title: "Institutional Research",
    text: "Admin-curated stock research notes, PDF company filings, and structured fundamental insights.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Access",
    text: "Stateless JWT authentication, Google OAuth2 Single Sign-On, and strict role-based route authorization.",
  },
  {
    icon: TrendingUp,
    title: "Walk-Forward Optimization",
    text: "Rolling in-sample training and out-of-sample testing windows to evaluate algorithmic strategy robustness.",
  },
];

const footerGroups = [
  ["InvestIND", "About Us", "Strategy Lab", "Paper Trading", "Careers", "Trust & Safety"],
  ["Products", "Stocks", "Portfolio", "Alerts", "Dashboard", "Transactions"],
  ["Resources", "Market News", "Help Center", "API Docs", "Learning", "Support"],
];

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Strategy Lab", href: "#features" },
  { label: "About", href: "#about" },
  { label: "Support", href: "#support" },
  { label: "Login", to: "/login", internal: true },
];

const heroActions = [
  { label: "Get Started Free", to: "/login", primary: true },
  { label: "Explore Platform", href: "#features", primary: false },
];

function MarketStrip() {
  return (
    <div className="landing-strip">
      <div className="landing-strip-track">
        {[...tickerItems, ...tickerItems].map(([symbol, price, change], index) => {
          const isPositive = change.startsWith("+");

          return (
            <div className="landing-strip-item" key={`${symbol}-${index}`}>
              <span>{symbol}</span>
              <strong>₹{price}</strong>
              <em className={isPositive ? "positive" : "negative"}>{change}</em>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Dynamic Stock Market Line/Area Chart for Hero Section
 */
function HeroStockChart({ series, currentVal, investedVal }) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const svgRef = useRef(null);

  const width = 600;
  const height = 220;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 25;
  const padBottom = 35;

  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const vals = series.map((d) => d.val);
  const minVal = Math.min(...vals, investedVal) * 0.995;
  const maxVal = Math.max(...vals, currentVal) * 1.005;

  const points = series.map((d, i) => {
    const x = padLeft + (i / (series.length - 1)) * plotWidth;
    const y = padTop + plotHeight - ((d.val - minVal) / (maxVal - minVal)) * plotHeight;
    return { x, y, ...d };
  });

  // Generate smooth cubic bezier curve SVG path
  function createSplinePath(pts) {
    if (pts.length === 0) return "";
    let path = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i != pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return path;
  }

  const linePath = createSplinePath(points);
  const lastPoint = points[points.length - 1] || { x: width - padRight, y: padTop + plotHeight / 2 };
  const areaPath = points.length > 0
    ? `${linePath} L ${lastPoint.x},${height - padBottom} L ${points[0].x},${height - padBottom} Z`
    : "";

  // Price grid levels
  const yTicks = [
    { label: "₹1,34k", y: padTop + plotHeight * 0.05 },
    { label: "₹1,32k", y: padTop + plotHeight * 0.40 },
    { label: "₹1,30k", y: padTop + plotHeight * 0.70 },
    { label: "₹1,28k", y: padTop + plotHeight * 0.95 },
  ];

  // Time grid levels
  const xTicks = [
    { label: "09:30", x: padLeft },
    { label: "11:00", x: padLeft + plotWidth * 0.27 },
    { label: "12:30", x: padLeft + plotWidth * 0.54 },
    { label: "14:00", x: padLeft + plotWidth * 0.81 },
    { label: "15:30", x: padLeft + plotWidth },
  ];

  const hoveredPoint = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="relative w-full select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        onMouseLeave={() => setHoverIndex(null)}
        onMouseMove={(e) => {
          if (!svgRef.current) return;
          const rect = svgRef.current.getBoundingClientRect();
          const mouseX = ((e.clientX - rect.left) / rect.width) * width;
          let closestIdx = 0;
          let minDiff = Infinity;
          points.forEach((pt, idx) => {
            const diff = Math.abs(pt.x - mouseX);
            if (diff < minDiff) {
              minDiff = diff;
              closestIdx = idx;
            }
          });
          setHoverIndex(closestIdx);
        }}
      >
        <defs>
          <linearGradient id="heroChartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
            <stop offset="60%" stopColor="#10b981" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>

          <linearGradient id="heroLineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="60%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>

        {/* Horizontal Gridlines & Price Ticks */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={padLeft}
              y1={tick.y}
              x2={width - padRight}
              y2={tick.y}
              stroke="rgba(148, 163, 184, 0.09)"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
            <text
              x={padLeft - 8}
              y={tick.y + 3.5}
              fill="#64748b"
              fontSize="9"
              textAnchor="end"
              fontFamily="ui-monospace, monospace"
            >
              {tick.label}
            </text>
          </g>
        ))}

        {/* Vertical Gridlines & Time Ticks */}
        {xTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={tick.x}
              y1={padTop}
              x2={tick.x}
              y2={height - padBottom}
              stroke="rgba(148, 163, 184, 0.05)"
              strokeWidth="1"
            />
            <text
              x={tick.x}
              y={height - padBottom + 16}
              fill="#64748b"
              fontSize="9.5"
              textAnchor="middle"
              fontFamily="ui-monospace, monospace"
            >
              {tick.label}
            </text>
          </g>
        ))}

        {/* Area Gradient Fill */}
        {areaPath && (
          <path
            d={areaPath}
            fill="url(#heroChartGradient)"
            className="transition-all duration-700 ease-out"
          />
        )}

        {/* Smooth Line Curve */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="url(#heroLineGradient)"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-700 ease-out"
          />
        )}

        {/* Pulsing Live Beacon on Current/Latest Point */}
        {lastPoint && (
          <g>
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r="7"
              fill="#10b981"
              opacity="0.3"
              className="animate-ping"
            />
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r="4"
              fill="#10b981"
              stroke="#0f172a"
              strokeWidth="1.5"
            />
          </g>
        )}

        {/* Hover Hairline Cursor & Highlight Point */}
        {hoveredPoint && (
          <g>
            <line
              x1={hoveredPoint.x}
              y1={padTop}
              x2={hoveredPoint.x}
              y2={height - padBottom}
              stroke="#38bdf8"
              strokeDasharray="2 2"
              strokeWidth="1.25"
            />
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.y}
              r="5"
              fill="#38bdf8"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          </g>
        )}
      </svg>

      {/* Interactive Tooltip Card */}
      {hoveredPoint && (
        <div
          className="pointer-events-none absolute -top-3 z-30 -translate-x-1/2 rounded-md border border-slate-700 bg-slate-900/95 px-2.5 py-1 text-center shadow-xl backdrop-blur-sm"
          style={{
            left: `${(hoveredPoint.x / width) * 100}%`,
          }}
        >
          <div className="font-mono text-[10px] text-slate-400">{hoveredPoint.time} IST</div>
          <div className="font-mono text-xs font-bold text-emerald-400">
            ₹{hoveredPoint.val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Modernized Hero Dashboard Visualizer
 */
function DashboardMockup() {
  const investedAmount = 128972.0;
  const [currentVal, setCurrentVal] = useState(134030.50);
  const [seriesData, setSeriesData] = useState(initialTimeSeries);
  const [stockCards, setStockCards] = useState(initialStockCards);

  // Subtle periodic micro-fluctuations (simulate real-time market ticks)
  useEffect(() => {
    const interval = setInterval(() => {
      // Natural market tick: ±₹12 to ±₹35
      const delta = (Math.random() - 0.46) * 32;
      setCurrentVal((prev) => {
        const next = Math.max(132500, Math.min(136000, prev + delta));
        return parseFloat(next.toFixed(2));
      });

      // Update the latest point in series
      setSeriesData((prev) => {
        const copy = [...prev];
        const lastIdx = copy.length - 1;
        copy[lastIdx] = {
          ...copy[lastIdx],
          val: parseFloat((copy[lastIdx].val + delta * 0.7).toFixed(2)),
        };
        return copy;
      });

      // Micro-adjust one stock card randomly
      setStockCards((prev) => {
        const copy = [...prev];
        const targetIdx = Math.floor(Math.random() * copy.length);
        const card = copy[targetIdx];
        const stockDelta = (Math.random() - 0.48) * 1.8;
        const newPrice = Math.max(100, parseFloat((card.price + stockDelta).toFixed(2)));
        const baseChange = parseFloat(card.change.replace("%", "").replace("+", ""));
        const newChangePct = (baseChange + (stockDelta / newPrice) * 100).toFixed(2);
        const isPos = parseFloat(newChangePct) >= 0;

        copy[targetIdx] = {
          ...card,
          price: newPrice,
          change: `${isPos ? "+" : ""}${newChangePct}%`,
          isPos,
        };
        return copy;
      });
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const profitLoss = currentVal - investedAmount;
  const returnPct = ((profitLoss / investedAmount) * 100).toFixed(2);
  const isProfit = profitLoss >= 0;

  return (
    <div className="dashboard-mockup">
      {/* Top Window Bar + Live Market Status */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="mockup-topbar !p-0">
            <span className="!w-2.5 !h-2.5 bg-rose-500/80 inline-block rounded-full" />
            <span className="!w-2.5 !h-2.5 bg-amber-500/80 inline-block rounded-full" />
            <span className="!w-2.5 !h-2.5 bg-emerald-500/80 inline-block rounded-full" />
          </div>

          <div className="ml-3 flex items-center gap-1.5 rounded-full border border-emerald-900/60 bg-emerald-950/40 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span className="uppercase tracking-wider text-[10px]">Live Market</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span className="rounded bg-slate-800/90 px-2 py-0.5 text-[10px] text-slate-300 font-medium">DEMO PORTFOLIO</span>
          <span className="hidden sm:inline text-slate-500">· NSE Session Active</span>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="mockup-grid mt-3">
        <div className="mockup-card">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Investment</p>
          <strong className="font-mono text-xl text-slate-100">
            ₹{investedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </strong>
          <small className="text-[11px] text-emerald-400 font-medium">+11.2% this month</small>
        </div>

        <div className="mockup-card">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Current Value</p>
          <strong className="font-mono text-xl text-white">
            ₹{currentVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </strong>
          <small className="text-[11px] text-slate-400">Real-time valuation</small>
        </div>

        <div className="mockup-card">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Profit / Loss</p>
          <strong className={`font-mono text-xl ${isProfit ? "profit" : "text-rose-400"}`}>
            {isProfit ? "+" : ""}₹{Math.abs(profitLoss).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </strong>
          <small className={`text-[11px] font-medium ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
            {isProfit ? "+" : ""}{returnPct}% return
          </small>
        </div>
      </div>

      {/* Modern Dynamic Area/Line Chart */}
      <div className="chart-panel !h-auto !p-3.5 mt-3.5 bg-slate-950/70 border border-slate-800/80 rounded-2xl">
        <div className="flex items-center justify-between px-2 pt-1 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-200">Portfolio Performance Trajectory</span>
            <span className="rounded bg-emerald-950/60 border border-emerald-800/50 px-1.5 py-0.5 text-[10px] font-mono text-emerald-300">
              +{returnPct}% Intraday
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">1D View</span>
        </div>

        <HeroStockChart
          series={seriesData}
          currentVal={currentVal}
          investedVal={investedAmount}
        />
      </div>

      {/* Stock Symbol Cards at Bottom */}
      <div className="watchlist mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2 !p-0 !border-0 !bg-transparent">
        {stockCards.map((stock) => (
          <div
            key={stock.symbol}
            className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/90 p-2.5 transition-colors hover:border-slate-700"
          >
            <div>
              <span className="block text-xs font-bold text-slate-200">{stock.symbol}</span>
              <span className="block font-mono text-[11px] text-slate-400">
                ₹{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <strong
              className={`font-mono text-xs font-semibold ${
                stock.isPos ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {stock.change}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Top Moving Stock Marquee (Preserved) */}
      <MarketStrip />

      {/* Header & Navigation */}
      <header className="landing-nav">
        <Link to="/" className="landing-brand">
          <span className="brand-mark">
            <img src={logo} alt="InvestIND Logo" className="h-8 w-auto object-contain" />
          </span>
          <span>
            <strong>InvestIND</strong>
            <small>Real-Time Stock Analytics</small>
          </span>
        </Link>

        <nav>
          {navLinks.map((item) =>
            item.internal ? (
              <Link key={item.label} to={item.to} className="nav-link-login">
                {item.label}
              </Link>
            ) : (
              <a key={item.label} href={item.href} className="nav-link">
                {item.label}
              </a>
            )
          )}
        </nav>
      </header>

      {/* Main Hero Section */}
      <main>
        <section className="landing-hero">
          <div className="hero-copy">
            <span className="hero-chip">Real-Time Indian Stock Analytics & Quantitative Lab</span>
            <h1>Grow your wealth with a smarter stock portfolio.</h1>
            <p>
              Simulate paper-trading with ₹1,00,000 capital, backtest quantitative strategies
              using TA4J, run walk-forward optimizations, and receive AI-grounded performance
              interpretations.
            </p>

            <div className="hero-actions">
              {heroActions.map((action) =>
                action.primary ? (
                  <Link key={action.label} to={action.to} className="primary-cta">
                    {action.label}
                  </Link>
                ) : (
                  <a key={action.label} href={action.href} className="secondary-cta">
                    {action.label}
                  </a>
                )
              )}
            </div>

            <div className="hero-proof">
              <span>Verified for</span>
              <strong>NSE / BSE</strong>
              <strong>Paper Trading</strong>
              <strong>Strategy Lab</strong>
              <strong>AI Analysis</strong>
            </div>
          </div>

          {/* Dynamic Hero Visualization */}
          <DashboardMockup />
        </section>

        {/* Market Category Strip */}
        <section className="logo-strip" aria-label="Platform capabilities">
          {[
            "BSE/NSE Stocks",
            "Portfolio Analytics",
            "Strategy Lab & TA4J",
            "Walk-Forward Analysis",
            "AI Grounded Reports",
          ].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </section>

        {/* Feature Grid */}
        <section className="features-section" id="features">
          <div className="section-heading">
            <span>Platform Capabilities</span>
            <h2>Everything your portfolio needs before the market moves.</h2>
          </div>

          <div className="feature-grid">
            {features.map(({ icon: Icon, title, text }) => (
              <article className="feature-card" key={title}>
                <div className="feature-icon-badge">
                  <Icon size={20} strokeWidth={2} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section className="about-section" id="about">
          <div>
            <span className="section-kicker">About InvestIND</span>
            <h2>Built for algorithmic precision and clear stock decisions.</h2>
            <p>
              InvestIND brings your paper-trading portfolio, atomic transactions, holdings,
              price alerts, quantitative backtests, and AI analysis into a single clean workspace.
              Designed for serious investors, engineers, and quantitative researchers.
            </p>
          </div>

          <div className="support-card" id="support">
            <div className="feature-icon-badge">
              <Headphones size={20} strokeWidth={2} />
            </div>
            <h3>24/7 Educational Platform Support</h3>
            <p>
              Explore algorithmic backtesting, simulated cash management, and institutional
              research reports in a risk-free paper-trading environment.
            </p>
            <Link to="/login">Start Trading Now</Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <div className="landing-brand">
            <span className="brand-mark">
              <img src={logo} alt="InvestIND Logo" className="h-6 w-auto object-contain" />
            </span>
            <span>
              <strong>InvestIND</strong>
              <small>Real-Time Stock Analytics</small>
            </span>
          </div>
          <p>
            Simulated portfolio management, quantitative strategy backtesting, and AI analytics
            for the Indian stock market.
          </p>
          <small>© 2026 InvestIND. All rights reserved.</small>
        </div>

        {footerGroups.map(([title, ...links]) => (
          <div className="footer-group" key={title}>
            <h4>{title}</h4>
            {links.map((item) => (
              <a href="#features" key={item}>
                {item}
              </a>
            ))}
          </div>
        ))}
      </footer>
    </div>
  );
}
