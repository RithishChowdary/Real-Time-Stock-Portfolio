import axiosClient from "../api/axiosClient";

export async function getDashboardSummary() {
  const response = await axiosClient.get("/dashboard/summary");
  return response.data;
}

export async function getDashboardHoldings() {
  const response = await axiosClient.get("/dashboard/holdings");
  return response.data;
}

export async function getRecentTransactions() {
  const response = await axiosClient.get("/dashboard/recent-transactions");
  return response.data;
}

export async function getDashboardNotifications() {
  const response = await axiosClient.get("/dashboard/notifications");
  return response.data;
}