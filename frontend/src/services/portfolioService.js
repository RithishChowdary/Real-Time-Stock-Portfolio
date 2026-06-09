import axiosClient from "../api/axiosClient";

export async function getPortfolios() {
  const response = await axiosClient.get("/portfolios");
  return response.data;
}

export async function getPortfolioById(id) {
  const response = await axiosClient.get(`/portfolios/${id}`);
  return response.data;
}

export async function createPortfolio(payload) {
  const response = await axiosClient.post("/portfolios", payload);
  return response.data;
}

export async function updatePortfolio(id, payload) {
  const response = await axiosClient.put(`/portfolios/${id}`, payload);
  return response.data;
}

export async function deletePortfolio(id) {
  const response = await axiosClient.delete(`/portfolios/${id}`);
  return response.data;
}