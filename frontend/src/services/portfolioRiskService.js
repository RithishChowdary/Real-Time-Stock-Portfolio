import axiosClient from "../api/axiosClient";

export async function getPortfolioRiskMetrics() {
  const response = await axiosClient.get("/portfolio/risk");
  return response.data;
}

export async function analyzePortfolioRisk() {
  const response = await axiosClient.post("/portfolio/risk/analysis");
  return response.data;
}
