 # InvestIND

  A full-stack portfolio management platform for Indian equities with real-time price
  updates, JWT auth, and a React dashboard. Built as a reference implementation of a
  production-shaped financial web app.

  Live: [stock-portfolio-frontend-omn1.onrender.com](https://stock-portfolio-frontend-omn1.onrender.com) ·
  API docs: [swagger-ui](https://real-time-stock-portfolio-production.up.railway.app/swagger-ui/index.html) ·
  Source: [GitHub](https://github.com/RithishChowdary/Real-Time-Stock-Portfolio)

  ## Why this exists

  Most "portfolio tracker" demos stop at CRUD. This one is wired end-to-end:
  real-time price fan-out over WebSockets, a price-trigger alert engine, refresh-token
  rotation, Google OAuth alongside local auth, and a deployable Docker stack. The
  point is to exercise the boring, load-bearing parts of a fintech backend —
  scheduling, caching, auth, transactional state — not just the UI.

  ## Stack

  | Layer       | Tech                                                          |
  |-------------|---------------------------------------------------------------|
  | Frontend    | React 19, Vite, React Router, Axios, Tailwind, Recharts       |
  | Realtime    | STOMP over SockJS                                             |
  | Backend     | Spring Boot 3.2.5, Java 21, Spring Security, Spring Data JPA  |
  | Auth        | JWT (access + refresh), Google OAuth2                         |
  | Persistence | MySQL 8, Hibernate, Caffeine cache                            |
  | Docs        | springdoc-openapi / Swagger UI                                |
  | External    | Twelve Data (price feed)                                      |
  | Deploy      | Docker Compose, Render                                        |

  ## Architecture

              ┌──────────────────────┐
              │  React SPA (Vite)    │
              │  - protected routes  │
              │  - STOMP subscriber  │
              └──────────┬───────────┘
                         │  HTTPS / JWT (Bearer)
                         ▼
      ┌──────────────────────────────────────────┐
      │  Spring Boot                             │
      │  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
      │  │ REST API │  │ Security │  │  WS /   │  │
      │  │ (Ctrl→Svc│  │  Filter  │  │  STOMP  │  │
      │  │  →Repo)  │  │  Chain  │  │ Broker  │  │
      │  └────┬─────┘  └────┬─────┘  └────┬────┘  │
      │       │             │             │       │
      │       │   @Scheduled price tick (60s)    │
      │       │             │             │       │
      │  ┌────▼─────────────▼─────────────▼────┐  │
      │  │  PriceService / AlertEngine / Cache │  │
      │  └────┬────────────────────────────────┘  │
      └───────┼───────────────────────────────────┘
              │  JPA / Hibernate
              ▼
          MySQL 8

      External: Twelve Data REST, Google OAuth2

  Key design choices:

  - **Backend is the source of truth for price state.** The frontend subscribes to
    `/topic/stocks`; the REST endpoint is for initial hydration only. This avoids
    clients disagreeing about price.
  - **Alert evaluation runs inline on the scheduler tick.** Single-process,
    single-instance, no external queue. Acceptable for the workload; see
    *Limitations* below.
  - **Refresh tokens are opaque, stored server-side.** Access tokens are short-lived
    JWTs. Logout invalidates the refresh token; access tokens self-expire.
  - **Caffeine caches per-symbol pricing** to dampen Twelve Data rate limits.

  ## Modules

  backend/src/main/java/com/major/stockportfolio/
  ├── config/        # Security, CORS, WebSocket, OpenAPI, Scheduling
  ├── controller/    # REST endpoints (thin)
  ├── service/       # Business logic (PriceService, AlertEngine, etc.)
  ├── repository/    # Spring Data JPA repos
  ├── entity/        # JPA entities (User, Portfolio, Stock, Transaction, ...)
  ├── dto/           # Request/response shapes
  ├── security/      # JWT filter, OAuth2 success handler, UserDetailsService
  ├── websocket/     # STOMP message broker config + publishers
  ├── exception/     # GlobalExceptionHandler (@RestControllerAdvice)
  └── util/          # JWT util, mappers

  ## REST API

  All routes under `/api`. Auth routes are public; everything else requires a
  `Bearer` access token. Refresh via `/api/auth/refresh`.

  | Method | Path                              | Purpose                                |
  |--------|-----------------------------------|----------------------------------------|
  | POST   | `/api/auth/register`              | Register local user                    |
  | POST   | `/api/auth/login`                 | Local login → access + refresh         |
  | POST   | `/api/auth/refresh`               | Rotate access token                    |
  | GET    | `/api/auth/me`                    | Current user profile                   |
  | GET    | `/api/auth/oauth2/**`             | Google OAuth entrypoint / callback     |
  | GET    | `/api/dashboard/summary`          | Aggregate portfolio metrics            |
  | GET    | `/api/dashboard/holdings`         | Holdings across portfolios             |
  | GET    | `/api/dashboard/recent`           | Recent transactions                    |
  | GET    | `/api/dashboard/performance`      | Time-series for charts                 |
  | GET    | `/api/portfolios`                 | List user portfolios                   |
  | POST   | `/api/portfolios`                 | Create portfolio                       |
  | GET    | `/api/portfolios/{id}`            | Portfolio detail + holdings            |
  | PUT    | `/api/portfolios/{id}`            | Update portfolio                       |
  | DELETE | `/api/portfolios/{id}`            | Delete portfolio                       |
  | GET    | `/api/stocks`                     | List stocks (paginated)                |
  | POST   | `/api/stocks`                     | Create stock                           |
  | GET    | `/api/stocks/{symbol}`            | Get stock by symbol                    |
  | POST   | `/api/stocks/{symbol}/refresh`    | Force refresh from Twelve Data         |
  | POST   | `/api/transactions`               | Record buy/sell                        |
  | GET    | `/api/transactions`               | List transactions                      |
  | GET    | `/api/transactions/holdings`      | Computed holdings w/ P&L               |
  | GET    | `/api/alerts`                     | List user's alerts                     |
  | POST   | `/api/alerts`                     | Create price alert                     |
  | DELETE | `/api/alerts/{id}`                | Delete alert                           |
  | GET    | `/api/notifications`              | List notifications                     |
  | PATCH  | `/api/notifications/{id}/read`    | Mark as read                           |
  | POST   | `/api/research`                   | Admin: upload research + PDF           |
  | GET    | `/api/research/{symbol}`          | Fetch research for a symbol            |
  | GET    | `/api/research/{id}/file`         | Download research PDF                  |

  Interactive docs at `/swagger-ui/index.html` once the backend is up.

  ## Data model

  users ──┬──< portfolios ──< transactions >── stocks
          ├──< alerts      ──────────────────> stocks
          └──< notifications
  research ──> stocks (by symbol)

  See `database/queries.sql` for the canonical DDL and `database/seedData.sql` for
  seed data. The ER diagram is in `docs/ER Diagram.png`.

  ## Real-time

  - **Transport:** STOMP over SockJS, in-memory simple broker.
  - **Topics:**
    - `/topic/stocks` — full price snapshot on every scheduled tick
    - `/topic/alerts` — emitted when an alert threshold is crossed
  - **Tick loop:** `@Scheduled(fixedRate = 60_000)` calls `PriceService.refresh()`,
    which pulls from Twelve Data, falls back to a bounded simulated walk if the
    upstream fails, persists to MySQL, then publishes to `/topic/stocks`.
    After publishing, `AlertEngine.evaluate()` runs against active alerts and
    fires notifications for any threshold crossings.

  ## Auth

  - **Local:** BCrypt-hashed passwords, JWT access token (short TTL) + opaque
    refresh token (long TTL, stored server-side, rotatable, revocable on logout).
  - **OAuth:** Google via Spring Security `oauth2Login()`. Successful login
    upserts a `User` row keyed on email and issues the same JWT pair as local
    login, so the rest of the app does not care which path the user took.
  - **Authorization:** method-level checks on portfolio/transaction ownership
    (a user can only read or mutate their own resources). Admin-only routes
    guarded by role check (research upload).

  ## Local development

  Prereqs: Java 21, Maven, Node 22, MySQL 8, a Twelve Data API key, optional
  Google OAuth credentials.

  ```bash
  # 1. Database
  mysql -u root -p -e "CREATE DATABASE stock_portfolio;"
  mysql -u root -p stock_portfolio < database/queries.sql
  mysql -u root -p stock_portfolio < database/seedData.sql

  # 2. Backend
  cd backend
  cp .env.example .env   # or export the vars below in your shell
  ./mvnw spring-boot:run # or: mvnw.cmd spring-boot:run on Windows

  # 3. Frontend
  cd ../frontend
  npm install
  npm run dev

  Backend: http://localhost:8080 · Swagger: http://localhost:8080/swagger-ui/index.html
  Frontend: http://localhost:5173

  Environment variables

  Backend:

  DB_URL=jdbc:mysql://localhost:3306/stock_portfolio
  DB_USERNAME=root
  DB_PASSWORD=...
  JWT_SECRET=<32+ random bytes, base64>
  TWELVEDATA_API_KEY=...
  GOOGLE_CLIENT_ID=...
  GOOGLE_CLIENT_SECRET=...
  SPRING_PROFILES_ACTIVE=dev

  Frontend (.env):

  VITE_API_BASE_URL=http://localhost:8080/api

  Docker

  docker compose up --build

  ┌──────────┬───────────┐
  │ Service  │ Host port │
  ├──────────┼───────────┤
  │ frontend │ 5173      │
  ├──────────┼───────────┤
  │ backend  │ 8080      │
  ├──────────┼───────────┤
  │ mysql    │ 3307      │
  └──────────┴───────────┘

  The compose file wires DB_URL=jdbc:mysql://mysql:3306/stock_portfolio and
  mounts a named volume for DB persistence.

  Operational notes

  - Logging: SLF4J via Logback defaults. Increase log level per package with
  logging.level.com.major.stockportfolio=DEBUG for local debugging.
  - CORS: configured in SecurityConfig for the deployed frontend origins;
  adjust the allowlist before pointing a new domain at the API.
  - Rate limits: Twelve Data free tier is request-budgeted. The Caffeine
  cache plus the 60s tick keeps us comfortably under it; if you shorten the
  tick interval, raise the cache TTL to compensate.
  - WebSocket auth: the STOMP handshake inherits the HTTP session, so the
  same JWT/cookie used by REST works for subscriptions.

  Known limitations / tradeoffs

  - Single-instance scheduler. The alert engine runs in-process on the
  scheduled tick. Two replicas would double-fire alerts. The fix is to move
  to a distributed scheduler (ShedLock, Quartz JDBC, or a leader-elected sidecar)
  before scaling out.
  - In-memory STOMP broker. Fine for one node; replace with an external
  broker (RabbitMQ STOMP plugin, Redis pub/sub) for horizontal scale.
  - No automated tests. Was scoped out to keep the surface area dense.
  The natural entry points are PriceService, AlertEngine, and the
  ownership checks on PortfolioController / TransactionController.
  - Price feed is best-effort. When Twelve Data is unavailable, prices
  drift via a bounded random walk so the UI doesn't freeze. Production would
  fail closed or fan out across multiple providers.
  - No background job for research emails / SMS. Notifications are
  in-app only.

  Roadmap

  - ShedLock or Quartz JDBC for the scheduler (multi-instance safe)
  - Watchlists
  - Backtesting (TA4J)
  - Candlestick + indicator charts
  - Email/SMS delivery for triggered alerts
  - Test pyramid: unit tests around services, integration tests with Testcontainers,
  contract tests for the REST surface
  - Migrate deploy to a container host (Fly.io / AWS ECS) with a managed MySQL

  License

  MIT.
