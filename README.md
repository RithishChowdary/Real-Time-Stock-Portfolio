# InvestIND - Real-Time Stock Portfolio Management

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![MySQL](https://img.shields.io/badge/MySQL-8-003B57?style=for-the-badge&logo=mysql&logoColor=F29111)](https://www.mysql.com)
[![JWT](https://img.shields.io/badge/JWT-Auth-FF6F00?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![Docker](https://img.shields.io/badge/Docker-Ready-0db7ed?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)

**InvestIND** is a full-stack real-time stock portfolio management platform built for tracking Indian stock investments, portfolio performance, transactions, alerts, notifications, and research insights from a modern web dashboard. 

The project combines a Spring Boot REST API backend, React frontend, MySQL persistence, JWT security, Google OAuth login, WebSocket-based live updates, scheduled stock price refresh, and Swagger API documentation.
 
## 🔗 Live Links

<p align="center">
  <a href="https://stock-portfolio-frontend-omn1.onrender.com"><b>🚀 Live Demo</b></a> |
  <a href="https://real-time-stock-portfolio.onrender.com/swagger-ui/index.html"><b>📄 API Docs</b></a> |
  <a href="https://github.com/RithishChowdary/Real-Time-Stock-Portfolio"><b>💻 GitHub</b></a>

> **Note:** The Live Demo is temporarily unavailable as the previous Railway deployment has expired. The application is currently being migrated to **AWS EC2**, and the demo link will be updated once deployment is complete. 
</p>

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Screenshots](#screenshots)
- [Core Modules](#core-modules)
- [API Modules](#backend-api-modules)
- [Database Design](#database-design)
- [Real-Time Functionality](#real-time-functionality)
- [Security](#security)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Local Setup](#local-setup)
- [Docker Setup](#docker-setup)
- [Future Enhancements](#future-enhancements)

## Project Overview

InvestIND helps users manage stock portfolios in a centralized dashboard. Users can register, log in, create portfolios, add stocks, record buy/sell transactions, track holdings, monitor profit and loss, create price alerts, receive notifications, and access stock research files.

The system is designed as a major full-stack project with strong emphasis on:

- Backend API design using Spring Boot
- Secure authentication and authorization
- Real-time stock price updates
- Database-driven portfolio and transaction management
- Clean React dashboard UI
- API documentation using Swagger
- Deployment-ready configuration with Docker and Render

## Key Features

- User registration and login
- Google OAuth authentication support
- JWT access token and refresh token flow
- Protected dashboard routes
- Portfolio creation and management
- Stock listing with pagination
- Live stock price fetch using Twelve Data API
- Fallback simulated price generation when live data is unavailable
- Buy and sell transaction management
- Holdings calculation with average price, current value, investment value, profit/loss, and return percentage
- Dashboard summary cards and performance visualization
- Recent transaction history
- Price alerts with target price and stop-loss support
- Notification system for triggered alerts
- WebSocket updates for live stock and alert events
- Scheduled stock refresh every 60 seconds
- Admin stock research upload with PDF support
- Swagger UI for API testing
- MySQL relational database
- Docker support for frontend, backend, and database

## Technology Stack

### Frontend

| Technology | Usage |
|---|---|
| React 19 | User interface development |
| Vite | Frontend build tool and dev server |
| React Router | Application routing and protected routes |
| Axios | API communication |
| Tailwind CSS | Responsive styling |
| Recharts | Charts and dashboard visualization |
| STOMP.js + SockJS | WebSocket client support |
| Lucide React / React Icons | UI icons |
| Framer Motion | UI animations |
| React Hot Toast | Toast notifications |

### Backend

| Technology | Usage |
|---|---|
| Java 21 | Backend runtime |
| Spring Boot 3.2.5 | Main backend framework |
| Spring Web | REST API development |
| Spring Data JPA | ORM and database access |
| Spring Security | Authentication and route protection |
| OAuth2 Client | Google login integration |
| JWT | Stateless access and refresh token security |
| Spring WebSocket | Real-time stock and alert updates |
| Spring Validation | Request validation |
| Spring Cache + Caffeine | Caching support |
| Lombok | Boilerplate reduction |
| Springdoc OpenAPI | Swagger documentation |
| MySQL Connector/J | MySQL database connectivity |

### Database and Deployment

| Technology | Usage |
|---|---|
| MySQL 8 | Relational database |
| Docker | Containerized setup |
| Docker Compose | Multi-service local deployment |
| Render | Cloud deployment for frontend and backend |
| Twelve Data API | External stock price source |

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

## Screenshots

### Landing Page

<img width="1899" height="950" alt="Screenshot 2026-07-31 085442" src="https://github.com/user-attachments/assets/3a35c8f6-3a80-48c2-be54-b79faa404c05" />

<img width="1897" height="953" alt="Screenshot 2026-07-31 085505" src="https://github.com/user-attachments/assets/b4d98d98-edbc-4196-bb9e-25b12a776240" />


### Authentication

Registration page:

<img width="1902" height="941" alt="image" src="https://github.com/user-attachments/assets/33f8ab8b-a78e-468f-88ff-cf854f6c4d6f" />

Login page:

<img width="1880" height="949" alt="image" src="https://github.com/user-attachments/assets/819d9051-d6fa-4e45-a188-6caffb2d9156" />


### Dashboard

<img width="1889" height="946" alt="image" src="https://github.com/user-attachments/assets/cd19eb64-7604-4641-b5aa-5c1b3eaa4851" />

<img width="1893" height="946" alt="image" src="https://github.com/user-attachments/assets/d0ef5308-1404-4553-9f33-c88d55a867f3" />

<img width="1891" height="948" alt="image" src="https://github.com/user-attachments/assets/c5782e33-f12b-4bda-822f-206adf4f10b6" />

### Portfolios

<img width="1919" height="937" alt="image" src="https://github.com/user-attachments/assets/b9b8b81d-f111-4736-9a68-accdbfd0e1ad" />

<img width="1898" height="949" alt="image" src="https://github.com/user-attachments/assets/3dffc7d4-4944-4c0c-ab51-8ac6de2e602d" />

### Stocks

<img width="1898" height="952" alt="image" src="https://github.com/user-attachments/assets/5be8eade-4d7e-47ba-9dac-db272cfe23e8" />

### Transactions

<img width="1898" height="946" alt="image" src="https://github.com/user-attachments/assets/f0994732-fa40-4e1f-8a44-abefdc72a047" />

### Notifications

<img width="1916" height="947" alt="image" src="https://github.com/user-attachments/assets/42581528-7e33-463d-8514-f090c4c7fa5c" />

### Alerts

<img width="1898" height="945" alt="image" src="https://github.com/user-attachments/assets/4c754a29-07dc-4dcb-b2e6-69707ff391a5" />


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

Hosted Swagger:


<img width="642" height="1280" alt="WhatsApp Image 2026-06-29 at 2 33 51 PM" src="https://github.com/user-attachments/assets/f73e06f8-c1cb-40a8-a2e5-21cf487476bf" />


<img width="639" height="1280" alt="WhatsApp Image 2026-06-29 at 2 33 51 PM (1)" src="https://github.com/user-attachments/assets/e1cbde76-ced7-45c9-825b-923405a49f6a" />



[https://real-time-stock-portfolio.onrender.com/swagger-ui/index.html](https://real-time-stock-portfolio.onrender.com/swagger-ui/index.html)


## Database Design

The application uses a MySQL database named:

```text
stock_portfolio
```

Main database tables:

| Table | Purpose |
|---|---|
| `users` | Stores user profile, credentials, role, and creation date |
| `portfolios` | Stores user-created portfolios |
| `stocks` | Stores stock symbol, company name, current price, and last update time |
| `transactions` | Stores buy/sell transaction history |
| `alerts` | Stores target price and stop-loss alerts |
| `notifications` | Stores user notifications |
| `stock_research` | Stores research title, summary, source URL, and PDF reference |

Database scripts are available in:

```text
database/queries.sql
database/seedData.sql
```

ER diagram:

![InvestIND ER Diagram](docs/ER%20Diagram.png)

## Real-Time Functionality

InvestIND uses Spring WebSocket with STOMP messaging for real-time updates.

| Topic | Purpose |
|---|---|
| `/topic/stocks` | Publishes stock price updates |
| `/topic/alerts` | Publishes triggered alert events |

The backend scheduler refreshes stock prices every 60 seconds:

```text
@Scheduled(fixedRate = 60000)
```

When prices change, the system:

1. Fetches the latest stock price from Twelve Data.
2. Falls back to simulated pricing if external data is unavailable.
3. Saves the updated price in MySQL.
4. Publishes the update through WebSocket.
5. Checks active alerts.
6. Creates notifications for triggered alerts.

## Security

Security is handled using Spring Security and JWT.

Important security features:

- BCrypt password encoding
- Stateless JWT authentication
- Refresh token support
- Google OAuth login support
- Protected API routes
- Protected React routes
- User-owned portfolio validation
- Global exception handling
- Request validation
- Role-based access support for admin research upload

## Exception Handling

The backend includes a centralized `GlobalExceptionHandler` using `@RestControllerAdvice`.

Handled exception types include:

- Resource not found
- Bad request
- Unauthorized access
- Duplicate resource
- Validation errors
- Unsupported media type
- Global server errors

This improves API reliability and returns consistent error responses for frontend handling.

## Project Structure

```text
Real-Time-Stock-Portfolio-main/
|-- README.md
|-- docker-compose.yml
|-- database/
|   |-- queries.sql
|   |-- seedData.sql
|-- docs/
|   |-- ER Diagram.png
|-- backend/
|   |-- Dockerfile
|   |-- pom.xml
|   |-- src/main/java/com/major/stockportfolio/
|       |-- config/
|       |-- controller/
|       |-- dto/
|       |-- entity/
|       |-- exception/
|       |-- repository/
|       |-- security/
|       |-- service/
|       |-- util/
|       |-- websocket/
|-- frontend/
|   |-- Dockerfile
|   |-- package.json
|   |-- vite.config.js
|   |-- src/
|       |-- api/
|       |-- components/
|       |-- context/
|       |-- hooks/
|       |-- pages/
|       |-- routes/
|       |-- services/
|       |-- utils/
```

## Environment Variables

### Backend

Create backend environment variables for database, JWT, Twelve Data, and Google OAuth.

```env
DB_URL=jdbc:mysql://localhost:3306/stock_portfolio
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_secure_jwt_secret
TWELVEDATA_API_KEY=your_twelvedata_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

For Docker Compose, the database host should be the MySQL service name:

```env
DB_URL=jdbc:mysql://mysql:3306/stock_portfolio
DB_USERNAME=root
DB_PASSWORD=root
```

### Frontend

Create a frontend environment file:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

For deployed frontend, set this to the hosted backend API URL.

## Local Setup

### Prerequisites

- Java 21
- Maven
- Node.js 22 or compatible version
- MySQL 8
- Twelve Data API key
- Google OAuth credentials

### 1. Clone the Repository

```bash
git clone https://github.com/RithishChowdary/Real-Time-Stock-Portfolio.git
cd Real-Time-Stock-Portfolio
```

### 2. Set Up the Database

Create the database:

```sql
CREATE DATABASE stock_portfolio;
```

Run the SQL scripts:

```text
database/queries.sql
database/seedData.sql
```

### 3. Run the Backend

```bash
cd backend
./mvnw spring-boot:run
```

On Windows:

```bash
mvnw.cmd spring-boot:run
```

Backend runs on:

```text
http://localhost:8080
```

Swagger UI:

```text
http://localhost:8080/swagger-ui/index.html
```

### 4. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## Docker Setup

The project includes Dockerfiles for frontend and backend, plus a root `docker-compose.yml`.

Run all services:

```bash
docker compose up --build
```

Services:

| Service | Port |
|---|---|
| Frontend | `5173` |
| Backend | `8080` |
| MySQL | `3307:3306` |

## API Documentation

Swagger documentation is available at:

```text
http://localhost:8080/swagger-ui/index.html
```


## Major Learning Outcomes

- Designing a full-stack financial dashboard
- Building secure REST APIs with Spring Boot
- Implementing JWT authentication and refresh token flow
- Integrating OAuth login
- Managing relational data with MySQL and JPA
- Building protected frontend routes with React
- Using WebSockets for real-time updates
- Scheduling background jobs in Spring Boot
- Handling global exceptions consistently
- Creating a Docker-ready deployment structure
- Documenting APIs with Swagger

## Future Enhancements

- Add Backtesting with TA4J
- Add candlestick charts and advanced technical indicators
- Add watchlists
- Add portfolio comparison reports
- Add downloadable portfolio statements
- Add email/SMS alert delivery
- Add Email-Validation
- Add unit and integration test coverage
- Add AWS Ec2 Deployment
- Add DevOps Architect 

## Conclusion

InvestIND is a complete real-time stock portfolio management system that demonstrates a production-style full-stack architecture. It combines secure authentication, portfolio management, live stock price updates, transaction tracking, alert notifications, and dashboard analytics into a single responsive web application.

This project is suitable as a major academic project and a GitHub portfolio project because it highlights backend engineering, frontend development, database design, real-time communication, deployment readiness, and API documentation.
