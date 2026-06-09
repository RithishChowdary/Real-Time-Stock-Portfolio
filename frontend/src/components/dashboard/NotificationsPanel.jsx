import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import { formatDateTime } from "../../utils/formatters";

export default function NotificationsPanel({ notifications }) {
  if (!notifications?.length) {
    return (
      <EmptyState
        title="No notifications"
        message="Triggered alerts and system messages will appear here."
      />
    );
  }

  return (
    <Card>
      <div className="mb-4 border-b border-slate-200 pb-3 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Notifications
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Recent alerts from your portfolio
        </p>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {notifications.slice(0, 5).map((notification) => (
          <div key={notification.id} className="py-3">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {notification.message}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {formatDateTime(notification.createdAt)}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}