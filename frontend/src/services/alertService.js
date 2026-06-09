import axiosClient from "../api/axiosClient";

export async function getAlerts() {
  const response = await axiosClient.get("/alerts");
  return response.data;
}

export async function createAlert(payload) {
  const response = await axiosClient.post("/alerts", payload);
  return response.data;
}