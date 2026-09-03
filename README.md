# InvestIND — Real-Time Stock Portfolio & Quantitative Analytics Platform

[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring%20Security-6-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)](https://spring.io/projects/spring-security)
[![TA4J](https://img.shields.io/badge/TA4J-0.18-00599C?style=for-the-badge)](https://github.com/ta4j/ta4j)
[![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8-003B57?style=for-the-badge&logo=mysql&logoColor=F29111)](https://www.mysql.com)
[![JWT](https://img.shields.io/badge/JWT-Stateless_Auth-FF6F00?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)

**InvestIND** is a full-stack Indian stock paper-trading, portfolio management, and quantitative analytics platform. It pairs a robust Spring Boot 3 backend and modern React 18 frontend with algorithmic backtesting powered by [TA4J](https://github.com/ta4j/ta4j), Walk-Forward out-of-sample optimization, grounded AI quantitative backtest analysis, and backend-authoritative AI Portfolio Risk Analysis.

> [!IMPORTANT]
> **Educational & Portfolio Purpose**: InvestIND is built for educational, quantitative research, and portfolio demonstration purposes. All trading executions and cash balances are simulated within a paper-trading environment. Backtest metrics and AI-assisted interpretations do not constitute financial advice, certified risk ratings, or guarantees of future performance.

---

## 🔗 Project Links

<p align="center">
  <a href="https://stock-portfolio-frontend-omn1.onrender.com"><b>🚀 Live Demo</b></a> |
  <a href="https://real-time-stock-portfolio.onrender.com/swagger-ui/index.html"><b>📄 API Docs</b></a> |
  <a href="https://github.com/RithishChowdary/Real-Time-Stock-Portfolio"><b>💻 GitHub</b></a>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Quantitative Trading Engine & Strategy Lab](#quantitative-trading-engine--strategy-lab)
- [AI Quantitative Analysis](#ai-quantitative-analysis)
- [AI Portfolio Risk Analysis](#ai-portfolio-risk-analysis)
- [Portfolio & Paper Trading Engine](#portfolio--paper-trading-engine)
- [Alerts & Notifications](#alerts--notifications)
- [Research Management (Admin-Only)](#research-management-admin-only)
- [Authentication & Security](#authentication--security)
- [Frontend Design System & UI](#frontend-design-system--ui)
- [Technology Stack](#technology-stack)
- [API Overview](#api-overview)
- [Environment Configuration](#environment-configuration)
- [Local Setup & Installation](#local-setup--installation)
- [Testing & Verification](#testing--verification)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Project Status](#project-status)
- [Limitations & Responsible Use](#limitations--responsible-use)
- [Future Enhancements](#future-enhancements)
- [Disclaimer](#disclaimer)

---

## Overview

InvestIND provides a unified environment for Indian stock market tracking, simulated trading execution, algorithmic strategy validation, and grounded portfolio risk evaluation:

1. **Portfolio & Paper-Trading Account**: Every user receives a backend-managed paper-trading cash account seeded with ₹1,00,000 initial virtual capital. Buy and Sell transactions execute with pessimistic database locking and authoritative weighted-average cost accounting.
2. **Strategy Lab & TA4J Backtesting**: Run quantitative algorithmic strategies (`EMA + RSI Momentum` and `EMA Dual Crossover`) against historical daily OHLCV market datasets with full trade statistics (Win Rate, Total Earnings, Profit Factor, Max Drawdown).
3. **Walk-Forward Optimization**: Evaluate strategy robustness across rolling in-sample parameter optimization and out-of-sample testing windows to reduce overfitting.
4. **AI Quantitative Analysis**: Grounded AI interpretation converts verifiable TA4J metrics into actionable performance explanations without hallucinating trades or prices.
5. **AI Portfolio Risk Analysis**: On-demand portfolio risk assessment where Java computes authoritative exposure, concentration, and liquidity metrics, and Google Gemini provides educational interpretation strictly grounded in those numbers.
6. **Admin Research Portal**: Dedicated administrative portal for publishing and managing stock research reports, executive summaries, and PDF filings with role-based route protection.

---

## Key Features

- **Authoritative Cash & Position Accounting**:
  - `PaperTradingAccount` is the sole source of truth for cash balances.
  - Pessimistic write locking prevents race conditions and balance discrepancies.
  - Weighted-average acquisition cost basis accounting properly handles partial and full SELL orders.
  - Insufficient funds strictly reject BUY orders; insufficient holdings reject SELL orders.
- **Quantitative Strategy Lab**:
  - Discrete execution of selectable algorithms (`EMA_RSI` and `EMA_CROSSOVER`).
  - True multi-metric backtest evaluation (Total Trades, Winning/Losing Trades, Win Rate, Profit Factor, Drawdown).
  - Isolated side-by-side strategy comparison and rolling Walk-Forward out-of-sample optimization.
- **AI Portfolio Risk Analysis**:
  - Embedded directly into the Portfolio management interface.
  - Deterministic Java-calculated portfolio risk metrics (score 0–100, risk tier, single-stock concentration, cash liquidity buffer).
  - Structured Gemini AI interpretation grounded strictly in backend metrics without hallucination.
- **AI-Powered Quantitative Reporting**:
  - Grounded interpretation using Google Gemini through an extensible backend provider abstraction (`AIAnalysisProvider`).
  - Generates structured executive summaries, risk breakdowns, and market regime analysis based exclusively on actual TA4J backtest outputs.
- **Stock Analytics & Market Data Fallback**:
  - Searchable Indian equity database.
  - Hybrid historical market data loader: integrates with Twelve Data and Alpha Vantage, automatically falling back to bundled classpath CSV historical datasets (`TCS`, `INFY`, `RELIANCE`, `HDFCBANK`) with thread-safe in-memory caching.
- **Configurable Price & Percentage Alerts**:
  - Set target price, stop-loss, profit percentage, and loss percentage thresholds.
  - Real-time notification feed for triggered events.
- **Role-Based Research Management**:
  - Admin-only PDF research document uploads (max 10MB) with stock linking.
  - Full CRUD management with secure file streaming and deletion.
  - Strict route protection (`AdminRoute`) and method-level `@PreAuthorize("hasRole('ADMIN')")`.
- **Stateless Security**:
  - JWT access tokens (7-day validity) and refresh tokens (30-day validity).
  - Google OAuth2 Single Sign-On and BCrypt password hashing.

---

## System Architecture

### High-Level Application Architecture

```text
                     +---------------------------------------+
                     |         React 18 + Vite Client        |
                     |  Tailwind CSS | Lucide Icons | Axios  |
                     +---------------------------------------+
                                         |
                                         | HTTPS REST / JWT
                                         v
                     +---------------------------------------+
                     |        Spring Boot 3.2 Backend        |
                     |         Spring Security 6             |
                     +---------------------------------------+
                         |               |               |
         +---------------+               |               +---------------+
         |                               |                               |
         v                               v                               v
+------------------+           +-------------------+           +-------------------+
|  Business Core   |           | Quantitative Lab  |           | AI Provider Layer |
|  - AuthService   |           |  - MarketDataLoader|          |  - AIAnalysisServ |
|  - AccountService|           |  - TA4J Engine    |           |  - GeminiAIProvider|
|  - TransactServ  |           |  - Walk-Forward   |           |  - PortRiskService|
|  - ResearchServ  |           +-------------------+           +-------------------+
+------------------+                     |                               |
         |                               v                               v
         |                     +-------------------+           +-------------------+
         |                     | Historical Market |           | Google Gemini API |
         |                     | Data (API / CSV)  |           | (Backend-only key)|
         v                     +-------------------+           +-------------------+
+------------------+
| MySQL 8 Database |
| (InnoDB / Locks) |
+------------------+
```

---

## Quantitative Trading Engine & Strategy Lab

The Strategy Lab provides automated strategy evaluation on Indian equities using historical OHLCV bar series.

### 1. Implemented Strategies
- **EMA + RSI Momentum (`EMA_RSI`)**: Combines Exponential Moving Averages (trend direction) with the Relative Strength Index (overbought/oversold momentum triggers).
- **EMA Dual Crossover (`EMA_CROSSOVER`)**: Generates buy signals when a fast EMA crosses above a slow EMA and sell signals on downward crosses.

### 2. Strategy Execution & Discrete Routing
The frontend sends the explicitly selected strategy in the backtest payload:

```json
POST /api/backtest
{
  "symbol": "INFY",
  "strategy": "EMA_CROSSOVER"
}
```

If omitted, the backend defaults to `EMA_RSI` for backward compatibility.

### 3. Quantitative Backtest Metrics
The engine calculates comprehensive trading statistics via TA4J:
- **Total Earnings**: Net profit/loss in currency.
- **Win Rate**: Percentage of profitable trades.
- **Total Trades / Winning Trades / Losing Trades**: Absolute trade counts.
- **Average Profit**: Mean return per closed position.
- **Maximum Drawdown**: Largest peak-to-trough portfolio equity drop during the test period.
- **Profit Factor**: Ratio of gross profits to gross losses.

> [!NOTE]
> **Zero-Trade Backtest Outcomes**: A backtest returning 0 trades (e.g., EMA + RSI over a non-trending consolidation dataset) is a **valid quantitative result** indicating no signal conditions were met. It represents realistic quantitative evaluation, not an application error.

### 4. Walk-Forward Optimization
Walk-forward analysis tests whether strategy parameters retain predictive value outside their training window.

```json
POST /api/backtest/walk-forward
{
  "symbol": "TCS"
}
```

The system splits historical bars into sequential training (in-sample optimization) and testing (out-of-sample validation) windows.

---

## AI Quantitative Analysis

InvestIND includes a backend-grounded AI analysis engine that transforms raw TA4J backtest statistics into structured financial explanations.

### Provider Architecture
```text
BacktestController ──> AIAnalysisService ──> AIAnalysisProvider (Interface)
                                                    │
                                                    ▼
                                            GeminiAIProvider
                                                    │
                                                    ▼
                                            Google Gemini API
```

- **Loose Coupling**: The `AIAnalysisProvider` interface allows swapping underlying LLM providers without modifying the quantitative core.
- **Strict Grounding**: The AI is supplied with authoritative TA4J `performanceMetrics` (trades, win rate, profit factor, drawdown) and strictly instructed to interpret the numbers without inventing trades, returns, or stock prices.
- **Structured Sections**:
  - **Executive Summary**: High-level strategy outcome.
  - **Performance Breakdown**: Trade distribution, expectancy, and win rate analysis.
  - **Strategy Strengths & Weaknesses**: Edge characteristics and execution friction.
  - **Risk Observations**: Maximum drawdown exposure and risk of ruin.
  - **Market Regime Suitability**: Performance in trending vs ranging markets.
  - **Quantitative Takeaway**: Practical algorithmic insights.

---

## AI Portfolio Risk Analysis

InvestIND features an on-demand AI Portfolio Risk Analysis system embedded directly into the existing Portfolio page.

### Architectural Principle
> **JAVA CALCULATES. GEMINI INTERPRETS.**
> 
> All financial arithmetic, position valuations, weights, liquidity ratios, and risk scores are calculated authoritatively in Java. Gemini AI receives verified numerical facts and produces structured educational interpretations without altering or inventing metrics.

### Architecture Flow
```text
Portfolio / Holdings / Transactions / PaperTradingAccount
                         ↓
              PortfolioRiskService (Java Source of Truth)
                         ↓
              PortfolioRiskMetrics (Authoritative DTO)
                         ↓
              AIAnalysisService
                         ↓
              AIAnalysisProvider
                         ↓
              GeminiAIProvider (Prompt Grounding & Schema)
                         ↓
              Structured AI Risk Analysis (Response)
                         ↓
              Portfolio UI (Embedded Dashboard Card)
```

### Authoritative Backend Risk Metrics Supported
- **Total Portfolio Value**: Available Cash + Current Market Value of Holdings.
- **Available Cash**: Unallocated virtual trading capital.
- **Holdings Value**: Current market valuation of active equity positions.
- **Total Investment**: Cost basis of remaining open positions.
- **Unrealized P&L**: Current Holdings Value minus Total Investment.
- **Return Percentage**: Percentage return on remaining invested capital.
- **Number of Active Holdings**: Count of distinct equity positions owned.
- **Largest Holding & Percentage**: Symbol, value, and portfolio weight of the largest position.
- **Position Exposure Breakdown**: Individual stock weights, market values, and unit prices.
- **Cash Allocation Percentage**: Available Cash as a proportion of total portfolio value.
- **Deterministic Risk Score**: An educational platform-level score ($0–100$) derived from concentration, position count, liquidity buffer, and unrealized return.
- **Risk Level**: Qualitative classification (`LOW`, `MODERATE`, `HIGH`, `VERY HIGH`).

### Anti-Hallucination Constraints & Grounding
- Gemini is explicitly instructed **never** to alter numbers, fabricate hypothetical trades, create artificial market prices, or guess unverified sector classifications.
- Gemini is strictly forbidden from describing current unrealized position losses as "realized losses" or as "drawdowns" (which require historical peak-to-trough equity curves).
- All AI observations are presented as educational review areas rather than automated trade triggers or certified financial advice.

---

## Portfolio & Paper Trading Engine

### 1. Capital & Cash Authority
- Fresh paper-trading accounts start with an initial cash balance of **₹1,00,000.00**.
- The `PaperTradingAccount` database entity is the **sole source of truth** for available cash. Frontend balance states are never trusted for order execution.

### 2. Transaction Atomicity & Weighted-Average Accounting
- **Pessimistic Locking**: `PaperTradingAccountRepository` uses `@Lock(LockModeType.PESSIMISTIC_WRITE)` when reading account balances during buy and sell transactions to prevent concurrency race conditions.
- **Core Valuation Identity**:
  $$\text{Total Portfolio Value} = \text{Available Cash} + \sum_{\text{holdings}} (\text{Remaining Quantity} \times \text{Current Market Price})$$
- **Weighted-Average Acquisition Price**:
  $$\text{Average Buy Price} = \frac{\sum (\text{buyQty} \times \text{buyPrice})}{\sum \text{buyQty}}$$
- **Partial and Full SELL Accounting**:
  - When shares are partially sold, the remaining quantity is decremented, while the **Average Buy Price** of the remaining shares remains invariant.
  - **Remaining Cost Basis**: $\text{Remaining Quantity} \times \text{Average Buy Price}$.
  - **SELL Execution Proceeds**: Credited atomically to `availableCash` at $\text{sellQty} \times \text{sellPrice}$.
  - **Realized P&L**: Calculated on the sold portion at $\text{sellQty} \times (\text{sellPrice} - \text{Average Buy Price})$.
  - **Unrealized P&L**: Calculated exclusively on remaining shares:
    $$\text{Unrealized P\&L} = (\text{Remaining Quantity} \times \text{Current Market Price}) - \text{Remaining Cost Basis}$$
  - Full position sales ($\text{Remaining Quantity} = 0$) close the holding, removing it from active valuation with zero residual unrealized P&L.

---

## Alerts & Notifications

- **Price & Percentage Trigger Rules**: Target price (upper threshold), stop-loss (lower threshold), profit percentage gain, and loss percentage drop.
- **Input Validation**: Rejects non-positive prices and invalid percentages; requires at least one condition per alert.
- **Lifecycle & Notifications**: Evaluated against live price updates, persisting unread notifications with mark-as-read management.

---

## Research Management (Admin-Only)

InvestIND includes a research document management system restricted strictly to platform administrators (`ROLE_ADMIN`).

- **Capabilities**: Upload PDF documents (up to 10MB), link research to specific equity tickers, structured metadata, and secure file streaming downloads.
- **Security & Authorization**: Backend endpoints protected with `@PreAuthorize("hasRole('ADMIN')")`; frontend protected via `AdminRoute` guard.

---

## Authentication & Security

- **Stateless JWT**: HMAC-SHA256 signed access tokens (7-day validity) and refresh tokens (30-day validity).
- **Role-Based Access Control (RBAC)**: `ROLE_USER` and `ROLE_ADMIN` mapped via `CustomUserDetailsService`.
- **Google OAuth2 Single Sign-On**: Automated account provisioning and token issuance.
- **Password Security**: BCrypt password hashing and centralized `@RestControllerAdvice` error responses.

---

## Frontend Design System & UI

InvestIND features a professional **Graphite / Charcoal** financial trading theme designed for clarity, high data density, and reduced visual fatigue:

- **Surface Palette**: Deep neutral charcoal backgrounds (`#0F1112`, `#141719`), dark card containers (`#181B1D`), elevated surfaces (`#1D2023`), and subtle borders (`#2A2E32`).
- **Semantic Financial Colors**:
  - **Positive Returns & Gains**: Green (`#00C896` / Emerald).
  - **Negative Losses & Alerts**: Red (`#FF4D5A` / Rose).
  - **Interactive Accents & Badges**: Restrained Blue (`#3B82F6`).
- **Clean Authentication**: Distraction-free charcoal login and registration cards with subtle borders (no artificial glowing AI gradients or particle effects).
- **Explicit Terminology**: Tables and summaries clearly distinguish *Avg Buy Price*, *Current Price*, *Invested Cost*, *Current Value*, and *Unrealized P&L*.
- **Integrated Risk Workflow**: AI Portfolio Risk Analysis is embedded directly within the existing Portfolio page without cluttering primary navigation.

---

## Technology Stack

| Layer | Technology | Version / Details |
|---|---|---|
| **Backend Runtime** | Java | OpenJDK 21 |
| **Backend Framework** | Spring Boot | 3.2.5 |
| **Security** | Spring Security & JWT | Spring Security 6, JJWT 0.11.5 |
| **OAuth2** | Spring Security OAuth2 Client | Google OAuth2 Login |
| **Quantitative Engine** | TA4J | 0.18 (BarSeries, Indicators, Rules, TradingRecord) |
| **Database & ORM** | MySQL & Spring Data JPA | MySQL 8, Hibernate (Pessimistic Locking) |
| **HTTP Client** | Java 11+ HttpClient | Asynchronous / Synchronous JSON communication |
| **AI Integration** | Google Gemini API | `gemini-1.5-flash` via REST endpoint |
| **Frontend Framework** | React | 18 |
| **Build Tool** | Vite | 8 |
| **Routing** | React Router | 6 (ProtectedRoute, AdminRoute) |
| **Styling** | Tailwind CSS | 3.4 (Graphite / Charcoal Theme Tokens) |
| **Icons & UI** | Lucide React | Modern vector icon suite |
| **HTTP Client** | Axios | Interceptors for JWT authorization headers |

---

## API Overview

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Login with email and password | Public |
| `POST` | `/api/auth/refresh` | Refresh expired access token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | User / Admin |

### Dashboard & Portfolio (`/api/dashboard`, `/api/portfolios`, `/api/portfolio/risk`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/dashboard/summary` | Portfolio summary (cash, holdings, P/L, return %) | User / Admin |
| `GET` | `/api/dashboard/holdings` | Current active stock holdings | User / Admin |
| `GET` | `/api/dashboard/recent-transactions` | Recent transaction history | User / Admin |
| `GET` | `/api/dashboard/performance` | Historical performance breakdown | User / Admin |
| `GET` | `/api/portfolios` | List user portfolios | User / Admin |
| `POST` | `/api/portfolios` | Create portfolio | User / Admin |
| `GET` | `/api/portfolio/risk` | Authoritative Java-calculated portfolio risk metrics | User / Admin |
| `POST` | `/api/portfolio/risk/analysis` | Current risk metrics + Gemini AI interpretation | User / Admin |

### Transactions (`/api/transactions`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/transactions/buy` | Execute BUY order with cash deduction | User / Admin |
| `POST` | `/api/transactions/sell` | Execute SELL order with proceeds credit | User / Admin |
| `GET` | `/api/transactions/history` | Complete transaction audit trail | User / Admin |
| `GET` | `/api/transactions/summary` | Portfolio valuation summary | User / Admin |
| `GET` | `/api/transactions/holdings` | Aggregated positions | User / Admin |

### Strategy Lab & Quantitative Backtesting (`/api/backtest`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/backtest` | Run TA4J backtest (`symbol`, `strategy`) | User / Admin |
| `POST` | `/api/backtest/walk-forward` | Execute rolling Walk-Forward optimization | User / Admin |
| `POST` | `/api/backtest/analysis` | Generate AI interpretation of backtest metrics | User / Admin |

### Alerts & Notifications (`/api/alerts`, `/api/notifications`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/alerts` | Create price/percentage alert | User / Admin |
| `GET` | `/api/alerts` | List active alerts for user | User / Admin |
| `DELETE` | `/api/alerts/{id}` | Delete alert rule | User / Admin |
| `GET` | `/api/notifications` | Get user notifications | User / Admin |
| `PUT` | `/api/notifications/{id}/read` | Mark notification as read | User / Admin |

### Research Management (`/api/research`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/research` | List all research reports | User / Admin |
| `GET` | `/api/research/stock/{stockId}` | List research reports by stock | User / Admin |
| `GET` | `/api/research/download/{file}` | Download research PDF | User / Admin |
| `POST` | `/api/research` | Upload research document & metadata | **Admin Only** |
| `DELETE` | `/api/research/{id}` | Delete research report & PDF | **Admin Only** |

---

## Environment Configuration

Create configuration files for backend and frontend. **Never commit actual API keys or credentials to version control.**

### Backend (`application.properties` or Environment Variables)

```env
# Database
DB_URL=jdbc:mysql://localhost:3306/stock_portfolio?createDatabaseIfNotExist=true&allowPublicKeyRetrieval=true&useSSL=false
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

# JWT Security
JWT_SECRET=your_base64_encoded_256bit_jwt_secret_key

# External Market Data (Optional)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
TWELVEDATA_API_KEY=your_twelvedata_api_key

# Google OAuth2 (Optional for SSO)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI Quantitative Analysis (Google Gemini)
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
```

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:8080/api
```

---

## Local Setup & Installation

### Prerequisites
- **Java 21 JDK**
- **Maven 3.8+**
- **Node.js 18+ & npm**
- **MySQL 8.0+**

### 1. Clone the Repository
```bash
git clone https://github.com/RithishChowdary/Real-Time-Stock-Portfolio.git
cd Real-Time-Stock-Portfolio
```

### 2. Configure Database
Start MySQL and create the database:
```sql
CREATE DATABASE stock_portfolio;
```

Seed base equity data using the provided scripts:
```bash
mysql -u your_user -p stock_portfolio < database/queries.sql
mysql -u your_user -p stock_portfolio < database/seedData.sql
```

### 3. Build and Run the Backend
```bash
cd backend

# Set Gemini API Key (optional for AI features)
# On Windows PowerShell:
$env:GEMINI_API_KEY="your_api_key_here"

# On Linux/macOS:
export GEMINI_API_KEY="your_api_key_here"

# Run tests
./mvnw.cmd clean test

# Launch backend server
./mvnw.cmd spring-boot:run
```
*Backend runs on `http://localhost:8080` (Swagger UI: `http://localhost:8080/swagger-ui/index.html`).*

### 4. Build and Run the Frontend
```bash
cd ../frontend

# Install dependencies
npm install

# Run Vite development server
npm run dev

# Or build for production
npm run build
```
*Frontend runs on `http://localhost:5173`.*

---

## Testing & Verification

The project includes an automated backend test suite and production build verification covering quantitative analysis, paper-trading atomicity, risk metrics, alert rules, and research operations.

### Automated Test Suite Status (`./mvnw.cmd clean test`)
```text
Results:
Tests run: 57, Failures: 0, Errors: 0, Skipped: 1

Breakdown:
- StockResearchServiceTest:          8 passed
- TransactionServiceTest:           14 passed
- AlertServiceTest:                  8 passed
- AIAnalysisServiceTest:             7 passed
- PortfolioRiskServiceTest:          6 passed
- PortfolioRiskControllerTest:       2 passed
- GeminiPortfolioRiskProviderTest:   2 passed
- DashboardServiceTest:              3 passed
- PaperTradingAccountServiceTest:    3 passed
- BacktestApiServiceTest:            3 passed
- StockportfolioApplicationTests:    1 skipped (live database bootstrap test intentionally disabled)

Status: BUILD SUCCESS (Total time: ~45s)
```

### Frontend Production Build (`npm run build`)
```text
vite v8.0.14 building client environment for production...
transforming... 1938 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                       0.50 kB │ gzip:   0.32 kB
dist/assets/favicon-qYxO9eex.png    379.93 kB
dist/assets/logo-Dg8EsIrU.png     1,159.63 kB
dist/assets/index-CQOQXUlN.css       53.35 kB │ gzip:  10.53 kB
dist/assets/index-DX02cWy6.js       541.67 kB │ gzip: 156.20 kB
✓ built in 2.83s (0 errors)
```

### Regression Verification Summary
- **Paper Trading**: BUY/SELL execution, partial SELL weighted-average preservation, full position closures, cash deductions, proceeds credit.
- **Portfolio & Holdings**: Multi-portfolio management, real-time valuation synchronization, holding aggregation.
- **Strategy Lab**: `EMA + RSI`, `EMA Crossover`, side-by-side strategy comparison, Walk-Forward rolling window optimizer.
- **AI Quantitative Analysis**: TA4J trade statistic explanations grounded in verified backtest outputs.
- **AI Portfolio Risk Analysis**: Deterministic risk metrics, concentration analysis, and grounded Gemini interpretation.
- **Admin Research & Route Security**: AdminRoute protection, PDF upload/download/deletion, and stock linking.
- **Market Data & Moving Tickers**: Active stock marquee animation on landing page and headers, CSV fallback cache.

---

## Project Structure

```text
Real-Time-Stock-Portfolio/
├── backend/
│   ├── src/main/java/com/major/stockportfolio/
│   │   ├── config/              # Security, Web & Swagger configurations
│   │   ├── controller/          # REST Controllers (Auth, Dashboard, Portfolio, Research, Transact)
│   │   ├── dto/                 # Request/Response Data Transfer Objects
│   │   ├── entity/              # JPA Entities (User, Portfolio, Account, Stock, Transaction)
│   │   ├── exception/           # Global Exception Handler & Custom Exceptions
│   │   ├── interfaces/          # Business Service Contracts
│   │   ├── quantitative/        # Quantitative Algorithmic Backtesting & Risk Core
│   │   │   ├── ai/              # AI Quantitative Analysis (Contracts, Service, GeminiProvider)
│   │   │   ├── config/          # Quantitative Properties
│   │   │   ├── contracts/       # Engine & Loader Interfaces
│   │   │   ├── dto/             # Backtest Requests, Responses, Metrics
│   │   │   ├── engine/          # TA4J Backtest Execution Engine
│   │   │   ├── exceptions/      # Quantitative domain exceptions
│   │   │   ├── indicator/       # TA4J Technical Indicator Helpers
│   │   │   ├── loader/          # FallbackMarketDataLoader, CsvMarketDataLoader, AlphaVantage
│   │   │   ├── optimizer/       # Walk-Forward & Strategy Parameter Optimizers
│   │   │   ├── risk/            # AI Portfolio Risk Analysis (Service, Controller, DTOs)
│   │   │   ├── service/         # BacktestApiService & Downloader Services
│   │   │   └── strategy/        # EMA_RSI & EMA_CROSSOVER Strategy Definitions
│   │   ├── repository/          # Spring Data JPA Repositories with Pessimistic Locks
│   │   ├── security/            # JWT Utils, Filters, CustomUserDetailsService, OAuth2 Handlers
│   │   └── service/             # Transaction, Account, Alert, Notification, Research Services
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── historical/NSE/      # Bundled Historical Daily Datasets (TCS, INFY, RELIANCE, HDFCBANK)
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios Client & Interceptors
│   │   ├── components/          # Reusable UI & Layout Components (Sidebar, Topbar, Card, Table)
│   │   │   ├── dashboard/       # DashboardCards, HoldingsTable
│   │   │   ├── portfolio/       # PortfolioCard, PortfolioForm, PortfolioRiskAnalysis
│   │   │   ├── stocks/          # StockTable, StockForm
│   │   │   ├── strategy/        # StrategyLabHeader, BacktestConfig, BacktestSummary, AIAnalysisPanel
│   │   │   ├── transactions/    # BuySellForm, PortfolioSummaryCards
│   │   │   └── ui/              # Button, Card, Input, EmptyState, Loader, Skeleton
│   │   ├── context/             # AuthContext (Role, Tokens, Session)
│   │   ├── hooks/               # Custom React Hooks
│   │   ├── pages/               # Dashboard, StrategyLab, Portfolios, Transactions, Research, Stocks, Auth
│   │   ├── routes/              # AppRoutes, ProtectedRoute, AdminRoute
│   │   ├── services/            # API Services (portfolioRiskService, backtest, auth, stock, research)
│   │   └── utils/               # Formatters, Validation & Metric Utilities
│   ├── package.json
│   └── vite.config.js
├── database/
│   ├── queries.sql              # Database Schema Definitions
│   └── seedData.sql             # Base Stock Seeds
├── docs/                        # Architectural Diagrams & Schemas
└── PROJECT_PROGRESS.md          # Complete Phase & Milestone Verification Tracking
```

---

## Screenshots

### Landing Page & Authentication
<p align="center">
  <img width="1898" height="941" alt="image" src="https://github.com/user-attachments/assets/bb0fd790-00a8-4a12-9198-f33f13cbb107" />
</p>

<p align="center">
  <img width="1919" height="947" alt="image" src="https://github.com/user-attachments/assets/b881d7f9-cd4f-4dc0-99f4-a900d5784798" />
</p>

### Dashboard & Analytics 
<p align="center">
  <img width="1879" height="944" alt="image" src="https://github.com/user-attachments/assets/80f96e8a-f0d5-4223-a2fe-0a35e2ab374c" />
</p>
<p align="center">
  <img width="1888" height="943" alt="image" src="https://github.com/user-attachments/assets/09ec1fd9-1b9a-4ff9-8a66-ec54ea8c6bb2" />
</p>
<p align="center">
  <img width="1873" height="945" alt="image" src="https://github.com/user-attachments/assets/58fbe3f8-7313-45b9-89e1-3d7f7a88d97c" />
</p>

### AI Portfolio Risk Analysis 
<p align="center">
  <img width="1901" height="944" alt="image" src="https://github.com/user-attachments/assets/3adc7d4c-315d-414b-8880-52143a0e92d7" />
</p>
<p align="center">
  <img width="1885" height="946" alt="image" src="https://github.com/user-attachments/assets/af028883-8818-4413-89d4-d4b745c2b835" />
</p>
<p align="center">
  <img width="1897" height="942" alt="image" src="https://github.com/user-attachments/assets/5d2c4584-d6e0-48d3-bb38-6a96507b6984" />
</p>
<p align="center">
  <img width="1886" height="947" alt="image" src="https://github.com/user-attachments/assets/d8d4ce23-08f6-4d41-a325-ab4fece8bd81" />
</p>

### Transactions & Price Alerts
<p align="center">
  <img width="1892" height="947" alt="image" src="https://github.com/user-attachments/assets/8d626b23-cfb1-4422-8094-2f4da5090cd4" />
</p>
<p align="center">
  <img width="1889" height="938" alt="image" src="https://github.com/user-attachments/assets/27dd0f79-0a04-4779-9504-08a80ffbc8df" />
</p>

### Strategy Lab
<p align="center">
  <img width="1885" height="947" alt="image" src="https://github.com/user-attachments/assets/12d9cf09-8f80-4cd4-8c32-10b0e300493f" />
</p>
<p align="center">
  <img width="1888" height="944" alt="image" src="https://github.com/user-attachments/assets/be35cddd-2c64-442e-a99a-8369d958c498" />
</p>

### Stocks & Notifications
<p align="center">
  <img width="1887" height="945" alt="image" src="https://github.com/user-attachments/assets/1bb4dd46-6947-4bdb-a198-84ea0af03e82" />
</p>
<p align="center">
  <img width="1913" height="944" alt="image" src="https://github.com/user-attachments/assets/a33a33ca-400f-4ba3-894c-ca113715a4cf" />
</p>

### Admin Research Management
<p align="center">
  <img width="1892" height="898" alt="image" src="https://github.com/user-attachments/assets/9aec33ab-da2a-4ee2-9c74-68ee74a446e7" />
</p>

---

## Project Status

| Phase | Milestone | Status |
|---|---|---|
| **Phase A** | Full Architecture Inspection & Analysis | **Completed** |
| **Phase B** | Paper-Trading Account & Cash Management (₹1,00,000 Initial Capital) | **Completed** |
| **Phase C** | Buy/Sell Backend Validation, Atomicity & Pessimistic Locking | **Completed** |
| **Phase D** | Transaction Interface Redesign & Validation | **Completed** |
| **Phase E** | Portfolio & Dashboard Valuation Synchronization | **Completed** |
| **Phase F** | Strategy Lab Frontend Polish | **Completed** |
| **Phase G** | Strategy Lab Backend API Integration (`/api/backtest`) | **Completed** |
| **Phase H** | Walk-Forward Optimization Integration (`/api/backtest/walk-forward`) | **Completed** |
| **Phase I** | AI Quantitative Analysis Integration (`/api/backtest/ai-analysis`) | **Completed** |
| **Phase J** | AI Portfolio Risk Analysis Integration (`/api/portfolio/risk/analysis`) | **Completed** |
| **Phase K** | Paper-Trading SELL Accounting Consistency Fix & Graphite UI Redesign | **Completed** |
| **Phase L** | Final End-to-End Verification & Documentation | **Completed** |

---

## Limitations & Responsible Use

1. **Simulated Paper Trading**: All trading executions, portfolios, and cash balances are virtual simulations. No live financial orders are placed with brokers or stock exchanges.
2. **Historical Backtesting Constraints**: Past backtest performance simulated by TA4J does not guarantee future market returns. Backtesting does not model real-world exchange slippage, market impact, or order queue priorities.
3. **Sector Metadata Limitation**: Sector breakdown is omitted from current portfolio risk metrics because verified sector master classifications are not stored in the stock master table (strict zero-fabrication principle).
4. **Historical Portfolio Drawdown**: While TA4J computes true maximum drawdown on historical backtest bars, open paper-trading portfolios evaluate current position returns rather than inferring or fabricating an unrecorded historical equity curve.
5. **AI Educational Interpretation**: AI-generated reports are educational interpretations grounded in verified metrics and must not be treated as automated trade signals or certified financial advice.
6. **Market Data Quotas & Fallback**: Real-time quotes depend on external API quotas. Classpath CSV historical datasets provide offline fallback capabilities for supported Indian equities (`TCS`, `INFY`, `RELIANCE`, `HDFCBANK`).

---

## Future Enhancements

- **Slippage & Transaction Fee Modeling**: Incorporate brokerage commissions, STT, and slippage into backtest calculations.
- **Advanced Position Sizing**: Support Kelly Criterion, fixed fractional, and volatility-adjusted position sizing.
- **Additional Quantitative Strategies**: Introduce Bollinger Band Mean Reversion, Supertrend, and MACD Divergence algorithms.
- **Portfolio-Level Quantitative Optimization**: Run multi-asset backtests with Modern Portfolio Theory (MPT) efficient frontier allocations.
- **Alert Dispatch Channels**: Support automated email and webhook notifications for triggered price alerts.

---

## Disclaimer

This software is developed strictly for educational, research, and portfolio demonstration purposes. It does not constitute financial, investment, legal, or trading advice. The author and contributors assume no liability for financial decisions, real-world trades, or simulated outcomes derived from using this application.
