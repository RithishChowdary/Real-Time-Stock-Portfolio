import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("refreshToken")
    ) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          {
            refreshToken: localStorage.getItem("refreshToken"),
          }
        );

        const data = response.data.data;

        localStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("portfolioId", data.portfolioId);

        originalRequest.headers.Authorization = `Bearer ${data.token}`;

        return axiosClient(originalRequest);
      } catch {
        localStorage.clear();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;