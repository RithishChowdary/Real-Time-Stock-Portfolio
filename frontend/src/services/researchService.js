import axiosClient from "../api/axiosClient";

export async function getResearchByStock(
  stockId
) {
  const response =
    await axiosClient.get(
      `/research/stock/${stockId}`
    );

  return response.data;
}