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
  <a href="https://real-time-stock-portfolio-production.up.railway.app/swagger-ui/index.html"><b>📄 API Docs</b></a> |
  <a href="https://github.com/RithishChowdary/Real-Time-Stock-Portfolio"><b>💻 GitHub</b></a>
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

```text
React Frontend
  - Landing page
  - Auth pages
  - Protected dashboard
  - Portfolio, stocks, transactions, alerts, notifications
        |
        | HTTPS REST API + JWT
        |
Spring Boot Backend
  - Controllers
  - Services
  - Repositories
  - Security filters
  - WebSocket publishers
  - Scheduler
        |
        | JPA / Hibernate
        |
MySQL Database

External Integrations:
  - Twelve Data API for stock prices
  - Google OAuth for login
  - WebSocket topics for live updates
```

## Screenshots

### Landing Page

<img width="1919" height="1077" alt="InvestIND Landing Page" src="https://github.com/user-attachments/assets/52caaca2-ec96-4741-bb0d-dbab396043be" />

<img width="1917" height="1069" alt="InvestIND Landing Page Features" src="https://github.com/user-attachments/assets/04fca131-d2ee-447c-978a-4aa2c9fef0dd" />

### Authentication

Registration page:

<img width="1919" height="1079" alt="InvestIND Registration Page" src="https://github.com/user-attachments/assets/2c782cc5-594c-4f0b-8737-045c021b04ac" />

Login page:

<img width="1919" height="1079" alt="InvestIND Login Page" src="https://github.com/user-attachments/assets/68783a80-58d7-44b5-b3d0-7baa0868b3e9" />

### Dashboard

<img width="1919" height="947" alt="InvestIND Dashboard Overview" src="https://github.com/user-attachments/assets/35891e6e-2c50-464a-8bb2-a7ea441caef4" />

<img width="1911" height="1079" alt="InvestIND Dashboard Charts" src="https://github.com/user-attachments/assets/e286ec06-5319-4031-ab26-c7d48bb6f508" />

<img width="1909" height="1079" alt="InvestIND Dashboard Holdings" src="https://github.com/user-attachments/assets/0d21d9f3-f7aa-4eb9-b104-e177ed0d08f3" />

### Portfolios

<img width="1919" height="1079" alt="InvestIND Portfolio List" src="https://github.com/user-attachments/assets/06413667-fa48-44cb-bb0e-e1c1b0d7723f" />

<img width="1898" height="1079" alt="InvestIND Portfolio Details" src="https://github.com/user-attachments/assets/e38a3b40-e7b1-4de6-8a04-d96e85a84748" />

### Stocks

<img width="1897" height="895" alt="InvestIND Stocks Page" src="https://github.com/user-attachments/assets/b86976ac-0461-49b6-9f80-9976b773e132" />

### Transactions

<img width="1919" height="1070" alt="InvestIND Transactions Page" src="https://github.com/user-attachments/assets/409dedfc-71e3-4b4e-a65d-8c70d1b5243a" />

### Notifications

<img width="1917" height="946" alt="InvestIND Notifications Page" src="https://github.com/user-attachments/assets/3fff5be1-fe5d-4d25-b1bb-01b3dd0f7df3" />

### Alerts

<img width="1919" height="951" alt="InvestIND Alerts Page" src="https://github.com/user-attachments/assets/3cbe85c1-2235-4335-a822-9489a6471519" />

## Core Modules

### 1. Landing Page

The landing page introduces InvestIND with a modern UI, project highlights, and navigation to authentication screens. It communicates the platform's purpose: portfolio tracking, stock monitoring, and investment visibility.

### 2. Authentication

Users can register, log in, and access protected pages. The backend uses Spring Security, BCrypt password hashing, JWT authentication, refresh tokens, and Google OAuth support.

### 3. Dashboard

The dashboard provides a quick overview of portfolio performance, holdings, market movement, recent transactions, notifications, and visual analytics.

### 4. Portfolio Management

Users can create and manage multiple portfolios. Each portfolio belongs to a user and contains transactions connected to stocks.

### 5. Stock Management

The stock module stores stock symbols, company names, current prices, and update timestamps. Stock prices can be refreshed from the Twelve Data API.

### 6. Transactions

The transactions module handles buy and sell operations. It calculates net holdings, average buy price, invested value, current value, profit/loss, and return percentage.

### 7. Alerts

Users can create target price and stop-loss alerts. When a stock crosses the configured price level, the system creates a notification and publishes a real-time alert event.

### 8. Notifications

Notifications are generated for important events such as triggered stock alerts. Users can view notifications and mark them as read.

### 9. Research Management

Admin users can upload stock research data and PDF files. Users can access research information for supported stocks.

## Backend API Modules

| Module | Base Path | Purpose |
|---|---|---|
| Authentication | `/api/auth` | Register, login, refresh token, current user |
| Dashboard | `/api/dashboard` | Summary, holdings, recent transactions, performance |
| Portfolios | `/api/portfolios` | Portfolio CRUD operations |
| Stocks | `/api/stocks` | Create stocks, list stocks, get symbol, refresh price |
| Transactions | `/api/transactions` | Buy, sell, holdings, summary, transaction history |
| Alerts | `/api/alerts` | Create alerts and view user alerts |
| Notifications | `/api/notifications` | View notifications and mark as read |
| Research | `/api/research` | Upload and download stock research |
| Swagger | `/swagger-ui/index.html` | API documentation |

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

Hosted Swagger:
<img width="642" height="1280" alt="WhatsApp Image 2026-06-29 at 2 33 51 PM" src="https://github.com/user-attachments/assets/f73e06f8-c1cb-40a8-a2e5-21cf487476bf" />


<img width="642" height="1280" alt="WhatsApp Image 2026-06-29 at 2 33 51 PM" src="https://github.com/user-attachments/assets/9af43c97-9c0e-489c-8f6b-cf91e0a8387e" />


[https://real-time-stock-portfolio.onrender.com/swagger-ui/index.html](https://real-time-stock-portfolio.onrender.com/swagger-ui/index.html)

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

- Add real broker API integration
- Add candlestick charts and advanced technical indicators
- Add watchlists
- Add portfolio comparison reports
- Add downloadable portfolio statements
- Add email/SMS alert delivery
- Add role-based admin dashboard
- Add unit and integration test coverage
- Add CI/CD pipeline
- Improve Docker Compose environment variable configuration

## Conclusion

InvestIND is a complete real-time stock portfolio management system that demonstrates a production-style full-stack architecture. It combines secure authentication, portfolio management, live stock price updates, transaction tracking, alert notifications, and dashboard analytics into a single responsive web application.

This project is suitable as a major academic project and a GitHub portfolio project because it highlights backend engineering, frontend development, database design, real-time communication, deployment readiness, and API documentation.
