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

**InvestIND** is a full-stack Indian stock paper-trading, portfolio management, and quantitative analytics platform. It pairs a robust Spring Boot 3 backend and modern React 18 frontend with algorithmic backtesting powered by [TA4J](https://github.com/ta4j/ta4j), Walk-Forward out-of-sample optimization, and AI-assisted quantitative performance analysis.

> [!IMPORTANT]
> **Educational & Portfolio Purpose**: InvestIND is built for educational, quantitative research, and portfolio demonstration purposes. All backtest metrics and walk-forward analyses are historical simulations and do not represent financial advice or guarantee future returns. Paper-trading trades and cash balances are simulated.

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
- [Portfolio & Paper Trading Engine](#portfolio--paper-trading-engine)
- [Alerts & Notifications](#alerts--notifications)
- [Research Management (Admin-Only)](#research-management-admin-only)
- [Authentication & Security](#authentication--security)
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

InvestIND provides a unified environment for stock market tracking, simulated trading execution, and algorithmic strategy validation:

1. **Portfolio & Paper-Trading Account**: Every user receives a backend-managed paper-trading cash account seeded with ₹1,00,000 initial capital. Buy/Sell transactions execute with pessimistic database locking and authoritative balance validation.
2. **Strategy Lab & TA4J Backtesting**: Run quantitative algorithmic strategies (`EMA + RSI Momentum` and `EMA Dual Crossover`) against historical daily OHLCV market datasets with full trade statistics (Win Rate, Total Earnings, Profit Factor, Max Drawdown).
3. **Walk-Forward Optimization**: Evaluate strategy robustness across rolling in-sample parameter optimization and out-of-sample testing windows to reduce overfitting.
4. **AI-Assisted Quantitative Interpretation**: Grounded AI analysis interprets verifiable TA4J metrics (strengths, risk factors, market regime suitability) through a backend provider architecture without hallucinating trades or prices.
5. **Admin Research Portal**: Dedicated administrative portal for publishing and managing stock research reports, executive summaries, and PDF filings with role-based route protection.

---

## Key Features

- **Authoritative Cash & Position Management**:
  - `PaperTradingAccount` is the single source of truth for cash balances.
  - Pessimistic write locking prevents race conditions and balance discrepancies.
  - Insufficient funds strictly reject BUY orders; insufficient holdings reject SELL orders.
  - Authoritative calculation of invested value, holdings value, realized P/L, and return percentage.
- **Quantitative Strategy Lab**:
  - Discrete execution of selectable algorithms (`EMA_RSI` and `EMA_CROSSOVER`).
  - True multi-metric backtest evaluation (Total Trades, Winning/Losing Trades, Win Rate, Profit Factor, Drawdown).
  - Isolated side-by-side strategy comparison.
  - Walk-Forward rolling train/test evaluation for out-of-sample validation.
- **AI-Powered Quantitative Reporting**:
  - Grounded interpretation using Google Gemini through an extensible backend provider abstraction (`AIAnalysisProvider`).
  - Generates structured executive summaries, risk breakdowns, and market regime analysis based exclusively on actual TA4J backtest outputs.
- **Stock Analytics & Market Data Fallback**:
  - Searchable Indian equity database.
  - Hybrid historical market data loader: fetches from Alpha Vantage and automatically falls back to bundled classpath CSV historical datasets (`TCS`, `INFY`, `RELIANCE`, `HDFCBANK`) with thread-safe in-memory caching.
- **Configurable Price & Percentage Alerts**:
  - Set target price, stop-loss, profit percentage, and loss percentage thresholds.
  - Authoritative backend and responsive frontend input validation.
  - Real-time notification feed for triggered events.
- **Role-Based Research Management**:
  - Admin-only PDF research document uploads (max 10MB) with stock linking.
  - Full CRUD management with secure file streaming and deletion.
  - Strict route protection (`AdminRoute`) and method-level `@PreAuthorize("hasRole('ADMIN')")`.
- **Stateless Security**:
  - JWT access tokens (7-day validity) and refresh tokens (30-day validity).
  - Google OAuth2 Single Sign-On.
  - BCrypt password hashing and user isolation.

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
|  - TransactServ  |           |  - Walk-Forward   |           +-------------------+
|  - ResearchServ  |           +-------------------+                     |
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

### Quantitative Engine Architecture

```text
Historical Market Data (Alpha Vantage / CSV Fallback)
         |
         v
FallbackMarketDataLoader (In-Memory ConcurrentHashMap Cache)
         |
         v
TA4J BarSeries (Daily OHLCV Candles)
         |
         +---------------------------------------+
         |                                       |
         v                                       v
EMA + RSI Strategy                     EMA Dual Crossover Strategy
(Short EMA, Long EMA, RSI)             (Fast EMA, Slow EMA)
         |                                       |
         +-------------------+-------------------+
                             |
                             v
                    BacktestEngine (TA4J)
                             |
                             v
                 PerformanceMetrics DTO
  (Win Rate, Total Trades, Profit Factor, Max Drawdown)
                             |
              +--------------+--------------+
              |                             |
              v                             v
   Strategy Comparison /          AI Quantitative Analysis
   Walk-Forward Optimization      (AIAnalysisProvider -> Gemini)
```

---

## Quantitative Trading Engine & Strategy Lab

The Strategy Lab provides automated strategy evaluation on Indian equities using real historical OHLCV bar series.

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

### 4. Independent Strategy Comparison
- Comparison metrics are populated exclusively for the strategy that was executed.
- Unexecuted strategies display `--`.
- Changing the selected stock automatically resets comparison metrics to prevent cross-asset data pollution.

### 5. Walk-Forward Optimization
Walk-forward analysis tests whether strategy parameters retain predictive value outside their training window.

```json
POST /api/backtest/walk-forward
{
  "symbol": "TCS"
}
```

The system splits historical bars into sequential training (in-sample optimization) and testing (out-of-sample validation) windows. The UI displays:
- Window number
- Training & testing bar counts
- Optimized indicator parameters
- Number of out-of-sample trades
- Testing window profit
- Cumulative out-of-sample profit

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

- **Loose Coupling**: The `AIAnalysisProvider` interface allows swapping underlying LLM providers (e.g., Anthropic, OpenAI, or local models) without modifying the quantitative core.
- **Strict Grounding**: The AI is supplied with authoritative TA4J `performanceMetrics` (trades, win rate, profit factor, drawdown) and strictly instructed to interpret the numbers without inventing trades, returns, or stock prices.
- **Structured Sections**:
  - **Executive Summary**: High-level strategy outcome.
  - **Performance Breakdown**: Trade distribution, expectancy, and win rate analysis.
  - **Strategy Strengths & Weaknesses**: Edge characteristics and execution friction.
  - **Risk Observations**: Maximum drawdown exposure and risk of ruin.
  - **Market Regime Suitability**: Performance in trending vs ranging markets.
  - **Quantitative Takeaway**: Practical algorithmic insights.

### Backend-Only Configuration
The Gemini API key is configured **exclusively on the backend** through environment variables:

```properties
ai.provider=${AI_PROVIDER:gemini}
ai.gemini.api-key=${GEMINI_API_KEY:}
ai.gemini.model=${GEMINI_MODEL:gemini-1.5-flash}
ai.gemini.base-url=${GEMINI_BASE_URL:https://generativelanguage.googleapis.com/v1beta/models/}
```

If `GEMINI_API_KEY` is not set, the application returns a clean advisory notice without crashing or exposing stack traces.

---

## Portfolio & Paper Trading Engine

### 1. Capital & Cash Authority
- Fresh paper-trading accounts start with an initial cash balance of **₹1,00,000.00**.
- The `PaperTradingAccount` database entity is the **sole source of truth** for available cash. Frontend balance states are never trusted for order execution.

### 2. Transaction Atomicity & Concurrency Control
- **Pessimistic Locking**: `PaperTradingAccountRepository` uses `@Lock(LockModeType.PESSIMISTIC_WRITE)` when reading account balances during buy and sell transactions.
- **BUY Order Flow**:
  1. Validates quantity $> 0$ and price $> 0$.
  2. Acquires pessimistic lock on `PaperTradingAccount`.
  3. Verifies `availableCash >= totalCost`. If insufficient, throws `BadRequestException("Insufficient funds")`.
  4. Deducts `totalCost` from cash balance, updates holdings, and records a `BUY` transaction.
- **SELL Order Flow**:
  1. Validates quantity $> 0$ and price $> 0$.
  2. Verifies current net holding quantity $\ge$ sell quantity. If insufficient, throws `BadRequestException("Insufficient holdings")`.
  3. Acquires pessimistic lock on `PaperTradingAccount`.
  4. Credits `proceeds` to cash balance, updates/closes position, and records a `SELL` transaction.
- **Negative Cash Prevention**: Enforces database and service invariants ensuring cash balances cannot become negative.

---

## Alerts & Notifications

- **Price & Percentage Trigger Rules**:
  - Target price (upper threshold)
  - Stop-loss (lower threshold)
  - Profit percentage gain
  - Loss percentage drop
- **Input Validation**:
  - Rejects zero and negative price/percentage inputs.
  - Requires at least one valid trigger condition per alert.
- **Lifecycle & Notifications**:
  - Evaluated against incoming stock price updates.
  - Creates persistent notification records when triggered.
  - Provides mark-as-read state management.

---

## Research Management (Admin-Only)

InvestIND includes a dedicated research document publication system restricted strictly to platform administrators (`ROLE_ADMIN`).

- **Capabilities**:
  - Upload fundamental research and institutional PDF documents (up to 10MB).
  - Searchable stock autocomplete linking reports to specific assets.
  - Structured metadata (Title, Summary, Source Reference URL).
  - Secure file streaming download and document deletion.
- **Security & Authorization**:
  - Backend: Endpoints protected with `@PreAuthorize("hasRole('ADMIN')")`.
  - Frontend: `AdminRoute` guard automatically redirects non-admin users attempting to access `/admin/research`.
  - Navigation: Sidebar dynamically filters out the Research Management link for normal `USER` accounts.

---

## Authentication & Security

- **Stateless JWT**: Access tokens and refresh tokens signed with HMAC-SHA256 (`JWT_SECRET`).
- **Role-Based Access Control (RBAC)**: Supports `ROLE_USER` and `ROLE_ADMIN` mapped via `CustomUserDetailsService`.
- **Google OAuth2 Single Sign-On**: Automated account provisioning and OAuth success handling with JWT issuance.
- **Password Security**: BCrypt password hashing.
- **Centralized Exception Handling**: `@RestControllerAdvice` (`GlobalExceptionHandler`) returns uniform API error responses.

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
| **Styling** | Tailwind CSS | 3.4 (Responsive Light/Dark theme support) |
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

### Dashboard & Portfolio (`/api/dashboard`, `/api/portfolios`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/dashboard/summary` | Portfolio summary (cash, holdings, P/L, return %) | User / Admin |
| `GET` | `/api/dashboard/holdings` | Current active stock holdings | User / Admin |
| `GET` | `/api/dashboard/recent-transactions` | Recent transaction history | User / Admin |
| `GET` | `/api/dashboard/performance` | Historical performance breakdown | User / Admin |
| `GET` | `/api/portfolios` | List user portfolios | User / Admin |
| `POST` | `/api/portfolios` | Create portfolio | User / Admin |

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
| `POST` | `/api/backtest/ai-analysis` | Generate AI interpretation of metrics | User / Admin |

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
# Optional initial seeds
mysql -u your_user -p stock_portfolio < database/queries.sql
mysql -u your_user -p stock_portfolio < database/seedData.sql
```

### 3. Build and Run the Backend
```bash
cd backend

# Set Gemini API Key (optional for AI analysis)
# On Windows PowerShell:
$env:GEMINI_API_KEY="your_api_key_here"

# On Linux/macOS:
export GEMINI_API_KEY="your_api_key_here"

# Run tests
mvn clean test

# Launch backend server
mvn spring-boot:run
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

The project includes an automated test suite covering quantitative analysis, backtest routing, cash atomicity, alert validation, and administrative research.

### Automated Test Suite Status
```text
Results:
Tests run: 44, Failures: 0, Errors: 0, Skipped: 1

Breakdown:
- StockResearchServiceTest:          8 passed
- TransactionServiceTest:           13 passed
- AlertServiceTest:                  8 passed
- AIAnalysisServiceTest:             7 passed
- PaperTradingAccountServiceTest:    3 passed
- BacktestApiServiceTest:            3 passed
- DashboardServiceTest:              1 passed
- StockportfolioApplicationTests:    1 skipped (live database bootstrap test intentionally disabled)

Status: BUILD SUCCESS (mvn clean test)
```

### Frontend Production Build
```text
vite v8.0.14 building client environment for production...
transforming... 1936 modules transformed.
rendering chunks...
dist/index.html                     0.50 kB
dist/assets/index-CsLffLE3.css     50.85 kB
dist/assets/index-DaMfnwU9.js     512.35 kB
built in 3.00s (0 errors)
```

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
│   │   ├── quantitative/        # Quantitative Algorithmic Backtesting Core
│   │   │   ├── ai/              # AI Quantitative Analysis (Contracts, Service, GeminiProvider)
│   │   │   ├── config/          # Quantitative Properties
│   │   │   ├── contracts/       # Engine & Loader Interfaces
│   │   │   ├── dto/             # Backtest Requests, Responses, Metrics
│   │   │   ├── engine/          # TA4J Backtest Execution Engine
│   │   │   ├── exceptions/      # Quantitative domain exceptions
│   │   │   ├── indicator/       # TA4J Technical Indicator Helpers
│   │   │   ├── loader/          # FallbackMarketDataLoader, CsvMarketDataLoader, AlphaVantage
│   │   │   ├── optimizer/       # Walk-Forward & Strategy Parameter Optimizers
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
│   │   ├── components/          # Reusable UI & Layout Components (Sidebar, Navbar, Card, Modal)
│   │   ├── context/             # AuthContext (Role, Tokens, Session)
│   │   ├── hooks/               # Custom React Hooks
│   │   ├── pages/               # Dashboard, StrategyLab, Portfolios, Transactions, Research, Alerts
│   │   ├── routes/              # AppRoutes, ProtectedRoute, AdminRoute
│   │   ├── services/            # API Services (Backtest, Auth, Stock, Research, Alerts)
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
  <img width="1919" height="945" alt="image" src="https://github.com/user-attachments/assets/799aa117-6a93-4d44-ad11-683b2fbf657e" />
</p>

### Dashboard & Analytics 
<p align="center">
 <img width="1891" height="944" alt="image" src="https://github.com/user-attachments/assets/634c51f8-05d2-461a-a94d-d567ed4aa83b" />
</p>
<p align="center">
 <img width="1903" height="948" alt="image" src="https://github.com/user-attachments/assets/4c33cde2-d595-46af-95e1-ba858dc39725" />
</p>
</p>
<p align="center">
<img width="1888" height="945" alt="image" src="https://github.com/user-attachments/assets/50f2e385-57b9-4b4a-a5c0-09dba1a46587" />
</p>

### Portfolios & Paper Trading 
<p align="center">
 <img width="1890" height="945" alt="image" src="https://github.com/user-attachments/assets/0f6f694b-01fb-4232-8dc9-30edadbdb5dd" />

  <img width="1892" height="946" alt="image" src="https://github.com/user-attachments/assets/bda607fa-e7f1-4e8d-a3a6-b78de0cfd008" />

<p align="center">
 <img width="1896" height="951" alt="image" src="https://github.com/user-attachments/assets/c2bee4ea-8184-456a-97bc-847009e41936" />

<img width="1919" height="949" alt="image" src="https://github.com/user-attachments/assets/9deaa286-b3e7-403d-b0a2-3be7294a4840" />
</p>

### Stocks & Price Alerts
<p align="center">
 <img width="1887" height="945" alt="image" src="https://github.com/user-attachments/assets/1bb4dd46-6947-4bdb-a198-84ea0af03e82" />

<img width="1896" height="944" alt="image" src="https://github.com/user-attachments/assets/7b7c1a1f-2f69-4efc-ab29-4c0912033ea5" />

<img width="1919" height="948" alt="image" src="https://github.com/user-attachments/assets/27b15480-ba28-405c-9c6a-849617751d16" />

</p>

### Admin Research Management
<p align="center">
  <img width="1892" height="898" alt="image" src="https://github.com/user-attachments/assets/9aec33ab-da2a-4ee2-9c74-68ee74a446e7" />
</p>
---

## Project Status

The project has completed all architectural and stabilization phases:

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
| **Phase J** | Final End-to-End Testing & Verification | **Completed** |

---

## Limitations & Responsible Use

1. **Simulated Environment**: All trading executions, portfolios, and cash balances are simulated. No real financial orders are placed with brokers or exchanges.
2. **Historical Backtest Simulation**: Past performance simulated by TA4J does not guarantee future results. Backtesting does not account for slippage, liquidity constraints, or live exchange order queues.
3. **Valid Zero-Trade Outcomes**: Strategies that generate zero trades during a testing period reflect market conditions that did not trigger algorithm parameters, which is a standard quantitative outcome.
4. **Market Data Quotas**: Live data relies on external third-party API quotas. Classpath CSV historical datasets are provided as fallbacks for supported Indian assets (`TCS`, `INFY`, `RELIANCE`, `HDFCBANK`).
5. **AI Interpretation**: AI-generated reports are interpretive summaries of backtest statistics and must not be treated as automated trading signals or financial advice.

---

## Future Enhancements

- **Slippage & Transaction Fee Modeling**: Incorporate brokerage commissions, STT, and slippage into backtest calculations.
- **Advanced Position Sizing**: Support Kelly Criterion, fixed fractional, and volatility-adjusted position sizing.
- **Additional Quantitative Strategies**: Introduce Bollinger Band Mean Reversion, Supertrend, and MACD Divergence algorithms.
- **Portfolio-Level Quantitative Optimization**: Run multi-asset backtests with Modern Portfolio Theory (MPT) efficient frontier allocations.
- **Alert Dispatch Channels**: Support automated email and webhook notifications for triggered price alerts.

---

## Disclaimer

This software is developed strictly for educational and portfolio demonstration purposes. It does not constitute financial, investment, or trading advice. The author and contributors assume no liability for financial decisions or simulated outcomes derived from this application.
