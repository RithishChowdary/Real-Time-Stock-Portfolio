import axiosClient from "../api/axiosClient";

export const markAsRead = (id) =>
  axiosClient.put(`/notifications/${id}/read`);

export const markAllAsRead = (userId) =>
  axiosClient.put(`/notifications/user/${userId}/read-all`);