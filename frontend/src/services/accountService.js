import axiosClient from "../api/axiosClient";

export async function getAccount() {
  const response = await axiosClient.get("/account");
  return response.data;
}

export async function getAccountBalance() {
  const response = await axiosClient.get("/account/balance");
  return response.data;
}

export async function resetAccount() {
  const response = await axiosClient.post("/account/reset");
  return response.data;
}
