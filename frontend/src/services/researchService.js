import axiosClient from "../api/axiosClient";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

export async function getResearchByStock(
  stockId
) {
  const response =
    await axiosClient.get(
      `/research/stock/${stockId}`
    );

  return response.data;
}

export function getResearchDownloadUrl(
  fileName
) {
  return `${API_BASE_URL}/research/download/${encodeURIComponent(
    fileName
  )}`;
}