import axiosClient from "../api/axiosClient";

export async function loginUser(payload) {
  const response = await axiosClient.post("/auth/login", payload);
  return response.data.data;
}

export async function registerUser(payload) {
  const response = await axiosClient.post("/auth/register", payload);
  return response.data.data;
}

export async function refreshAccessToken(refreshToken) {
  const response = await axiosClient.post("/auth/refresh", { refreshToken });
  return response.data.data;
}

export async function getCurrentUser() {

  const response =
    await axiosClient.get(
      "/auth/me"
    );

  return response.data;
}