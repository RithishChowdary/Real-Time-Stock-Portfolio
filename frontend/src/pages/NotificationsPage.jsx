import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Loader from "../components/ui/Loader";
import { getDashboardNotifications } from "../services/dashboardService";
import { formatDateTime } from "../utils/formatters";
import {
  markAsRead,
  markAllAsRead
} from "../services/notificationService";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  async function loadNotifications() {
    setLoading(true);
    setError("");

    try {
      const data = await getDashboardNotifications();
      setNotifications(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load notifications"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const unreadCount = notifications.filter(
    (n) => !n.isRead
  ).length;

 async function markAsReadHandler(id) {

  await markAsRead(id);

  loadNotifications();
}

  async function markAllAsReadHandler() {

  await markAllAsRead(auth.id);

  loadNotifications();
}

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>

          <div className="border-b border-slate-200 dark:border-slate-800 pb-1.5">
    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
     Notifications
    </h1>
  </div>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Review alerts and portfolio messages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {unreadCount} Unread
          </span>

          <button
            onClick={markAllAsReadHandler}
            disabled={unreadCount === 0}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Mark As Read
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filter */}
      {!loading && notifications.length > 0 && (
        <Card>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "border border-slate-300 dark:border-slate-700"
              }`}
            >
              All
            </button>

            <button
              onClick={() => setFilter("unread")}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                filter === "unread"
                  ? "bg-blue-600 text-white"
                  : "border border-slate-300 dark:border-slate-700"
              }`}
            >
              Unread
            </button>
          </div>
        </Card>
      )}

      {!notifications.length ? (
        <EmptyState
          title="No notifications"
          message="Triggered alerts will appear here."
        />
      ) : (
        <Card>
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {notification.message}
                  </p>

                  <span
                    className={`w-fit rounded-full px-2 py-1 text-xs font-semibold ${
                      notification.isRead
                        ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}
                  >
                    {notification.isRead
                      ? "Read"
                      : "Unread"}
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  {formatDateTime(
                    notification.createdAt
                  )}
                </p>

                {!notification.isRead && (
                  <button
                    onClick={() =>
                  markAsReadHandler(notification.id)
                }
                    className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}