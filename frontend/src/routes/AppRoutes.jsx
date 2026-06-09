import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

import DashboardLayout from "../components/layout/DashboardLayout";

import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import OAuthSuccessPage from "../pages/OAuthSuccessPage";

import DashboardPage from "../pages/DashboardPage";
import PortfoliosPage from "../pages/PortfoliosPage";
import PortfolioDetailPage from "../pages/PortfolioDetailPage";
import StocksPage from "../pages/StocksPage";
import TransactionsPage from "../pages/TransactionsPage";
import AlertsPage from "../pages/AlertsPage";
import NotificationsPage from "../pages/NotificationsPage";
import ResearchManagementPage from "../pages/ResearchManagementPage";

import NotFoundPage from "../pages/NotFoundPage";

export default function AppRoutes() {
  return (
    <Routes>

      {/* Public Routes */}

      <Route path="/" element={<LandingPage />} />

      <Route
        path="/LandingPage"
        element={<LandingPage />}
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      <Route
        path="/oauth-success"
        element={<OAuthSuccessPage />}
      />

      {/* Protected Routes */}

      <Route element={<ProtectedRoute />}>

        <Route element={<DashboardLayout />}>

          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="/portfolios"
            element={<PortfoliosPage />}
          />

          <Route
            path="/portfolios/:id"
            element={<PortfolioDetailPage />}
          />

          <Route
            path="/stocks"
            element={<StocksPage />}
          />

          <Route
            path="/transactions"
            element={<TransactionsPage />}
          />

          <Route
            path="/alerts"
            element={<AlertsPage />}
          />

          <Route
            path="/notifications"
            element={<NotificationsPage />}
          />

          {/* Research Page */}

          <Route
            path="/admin/research"
            element={<ResearchManagementPage />}
          />

        </Route>

      </Route>

      {/* 404 */}

      <Route
        path="*"
        element={<NotFoundPage />}
      />

    </Routes>
  );
}