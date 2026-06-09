import axiosClient from "../api/axiosClient";

export async function buyStock(payload) {
  const response = await axiosClient.post("/transactions/buy", payload);
  return response.data;
}

export async function sellStock(payload) {
  const response = await axiosClient.post("/transactions/sell", payload);
  return response.data;
}

export async function getMyTransactions() {
  const response = await axiosClient.get("/transactions");
  return response.data;
}

export async function getPortfolioTransactions(portfolioId, page = 0, size = 5) {
  const response = await axiosClient.get(
    `/transactions/portfolio/${portfolioId}?page=${page}&size=${size}`
  );
  return response.data;
}

export async function getPortfolioHoldings(portfolioId) {
  const response = await axiosClient.get(`/transactions/holdings/${portfolioId}`);
  return response.data;
}

export async function getPortfolioSummary(portfolioId) {
  const response = await axiosClient.get(`/transactions/summary/${portfolioId}`);
  return response.data;
}