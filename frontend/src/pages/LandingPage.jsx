import { Link } from "react-router-dom";
import { FaWallet } from "react-icons/fa";
import {
  FaBell,
  FaChartLine,
  FaHeadset,
  FaShieldAlt,
} from "react-icons/fa";
import logo from "../assets/logo.png";

const tickerItems = [
  ["NIFTY 50", "22,812.30", "+0.85%"],
  ["SENSEX", "74,910.40", "+0.62%"],
  ["BANKNIFTY", "48,252.15", "-0.18%"],
  ["TCS", "2,263.02", "+1.24%"],
  ["INFY", "1,222.20", "+0.60%"],
  ["GOKEX", "692.58", "+1.32%"],  
  ["HCLTECH", "1,246.60", "+2.57%"],
  ["SBIN", "1,193.82", "+0.50%"],
];

const features = [
  {
    icon: FaChartLine,
    title: "Live Portfolio Analytics",
    text: "Track holdings, returns, market value, profit and loss in one focused dashboard.",
  },
  {
    icon: FaBell,
    title: "Realtime Alerts",
    text: "Create target and stop-loss alerts, then receive notifications as prices update.",
  },
  {
    icon: FaWallet,
    title: "Portfolio Control",
    text: "Manage multiple portfolios, buy and sell stocks, and review transaction history.",
  },
  {
    icon: FaShieldAlt,
    title: "Secure Access",
    text: "Protected routes, JWT login, Google OAuth and ownership-safe backend APIs.",
  },
];

const footerGroups = [
  ["InvestIND", "About Us", "Pricing", "Blog", "Careers", "Trust & Safety"],
  ["Products", "Stocks", "Portfolio", "Alerts", "Dashboard", "Transactions"],
  ["Resources", "Market News", "Help Center", "API Docs", "Learning", "Support"],
];

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
  { label: "Support", href: "#support" },
  { label: "Login", to: "/login", internal: true },
];

const heroActions = [
  { label: "Get Started", to: "/login", primary: true },
  { label: "Explore Features", href: "#features", primary: false },
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
              <strong>{price}</strong>
              <em className={isPositive ? "positive" : "negative"}>{change}</em>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="dashboard-mockup">
      <div className="mockup-topbar">
        <span />
        <span />
        <span />
      </div>

      <div className="mockup-grid">
        <div className="mockup-card">
          <p>Total Investment</p>
          <strong>₹1,28,972</strong>
          <small>+11.2% this month</small>
        </div>
        <div className="mockup-card">
          <p>Current Value</p>
          <strong>₹1,34,030</strong>
          <small>Realtime refresh</small>
        </div>
        <div className="mockup-card">
          <p>Profit / Loss</p>
          <strong className="profit">₹5,058</strong>
          <small>3.92% return</small>
        </div>
      </div>

      <div className="chart-panel">
        <div className="chart-bars">
          {Array.from({ length: 38 }).map((_, index) => (
            <span
              key={index}
              style={{
                height: `${32 + ((index * 19) % 92)}px`,
                background: index % 4 === 0 ? "#ef4444" : "#10b981",
              }}
            />
          ))}
        </div>
      </div>

      <div className="watchlist">
        {["TCS", "INFY", "GOKEX"].map((symbol, index) => (
          <div key={symbol}>
            <span>{symbol}</span>
            <strong>{index === 0 ? "+1.24%" : index === 1 ? "+0.60%" : "+1.32%"}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="landing-page">
      <MarketStrip />

      <header className="landing-nav">
        <Link to="/" className="landing-brand">
          <span className="brand-mark">
            <img src={logo} alt="Logo" className="h-8 w-auto object-contain" />
          </span>
          <span>
            <strong>InvestIND</strong>
            <small>Real-Time Stock Analytics</small>
          </span>
        </Link>

        <nav>
          {navLinks.map((item) =>
            item.internal ? (
              <Link key={item.label} to={item.to} className="nav-link">
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

      <main>
        <section className="landing-hero">
          <div className="hero-copy">
            <span className="hero-chip">Invest in India with realtime insight</span>
            <h1>Grow your wealth with a smarter stock portfolio.</h1>
            <p>
              Monitor Indian stocks, holdings, alerts and performance from one
              professional dashboard built for fast decisions.
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
              <span>Trusted workflow for</span>
              <strong>NSE</strong>
              <strong>BSE</strong>
              <strong>Portfolios</strong>
              <strong>Alerts</strong>
            </div>
          </div>

          <DashboardMockup />
        </section>

        <section className="logo-strip" aria-label="Market categories">
          {["BSE/NSE Stocks", "Portfolio Analytics", "Realtime Alerts", "JWT Secure", "Google Login"].map(
            (item) => (
              <span key={item}>{item}</span>
            )
          )}
        </section>

        <section className="features-section" id="features">
          <div className="section-heading">
            <span>Platform Features</span>
            <h2>Everything your portfolio needs before the market moves.</h2>
          </div>

          <div className="feature-grid">
            {features.map(({ icon: Icon, title, text }) => (
              <article className="feature-card" key={title}>
                <Icon />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-section" id="about">
          <div>
            <span className="section-kicker">About InvestIND</span>
            <h2>Built for clear stock decisions, not noisy screens.</h2>
            <p>
              InvestIND brings your portfolio, transactions, holdings, alerts and
              market movement into a single clean workspace. It is designed for
              students, investors and builders who want a practical real-time
              stock portfolio product.
            </p>
          </div>

          <div className="support-card" id="support">
            <FaHeadset />
            <h3>24/7 Customer Support</h3>
            <p>
              Add live chat, help center articles and onboarding guides here when
              your product goes live.
            </p>
            <Link to="/login">Start Investing now</Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="footer-brand">
          <div className="landing-brand">
            <span className="brand-mark">
              <img src={logo} alt="Logo" className="h-6 w-auto object-contain" />
            </span>
            <span>
              <strong>InvestIND</strong>
              <small>Real-Time Stock Analytics</small>
            </span>
          </div>
          <p>
            Portfolio analytics, stock tracking and alerts for the Indian market.
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
