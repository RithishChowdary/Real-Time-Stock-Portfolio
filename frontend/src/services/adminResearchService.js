import axiosClient from "../api/axiosClient";

/**
 * Fetch all uploaded research reports.
 */
export async function getAllResearch() {
  const response = await axiosClient.get("/research");
  return response.data;
}

/**
 * Fetch research reports for a specific stock.
 */
export async function getResearchByStock(stockId) {
  const response = await axiosClient.get(`/research/stock/${stockId}`);
  return response.data;
}

/**
 * Upload a new research report (Admin only).
 * @param {Object} data - { stockId, title, summary, sourceUrl }
 * @param {File} pdf - PDF file
 */
export async function uploadResearch(data, pdf) {
  const formData = new FormData();

  formData.append(
    "data",
    new Blob([JSON.stringify(data)], {
      type: "application/json",
    })
  );

  formData.append("pdf", pdf);

  const response = await axiosClient.post("/research", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

/**
 * Delete a research report (Admin only).
 */
export async function deleteResearch(id) {
  const response = await axiosClient.delete(`/research/${id}`);
  return response.data;
}

/**
 * Build download URL for research PDF.
 */
export function getResearchDownloadUrl(fileName) {
  if (!fileName) return "#";
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
  return `${baseUrl}/research/download/${encodeURIComponent(fileName)}`;
}