import axiosClient from "../api/axiosClient";

export async function getStocks(page = 0, size = 5) {
  const response = await axiosClient.get(
    `/stocks?page=${page}&size=${size}`
  );
  return response.data;
}

export async function getStockBySymbol(symbol) {
  const response = await axiosClient.get(
    `/stocks/${symbol}`
  );
  return response.data;
}

export async function getLivePrice(symbol) {
  const response = await axiosClient.get(
    `/stocks/price/${symbol}`
  );
  return response.data;
}

export async function refreshStockPrice(symbol) {
  const response = await axiosClient.put(
    `/stocks/refresh/${symbol}`
  );
  return response.data;
}

export async function searchStocks(query) {
  const response = await axiosClient.get(
    "/stocks?page=0&size=100"
  );

  const stocks = response.data.content || [];

  return stocks.filter(
    (stock) =>
      stock.symbol?.toLowerCase().includes(query.toLowerCase()) ||
      stock.companyName?.toLowerCase().includes(query.toLowerCase())
  );
}

export async function createStock(payload) {
  const response = await axiosClient.post(
    "/stocks",
    payload
  );
  return response.data;
}