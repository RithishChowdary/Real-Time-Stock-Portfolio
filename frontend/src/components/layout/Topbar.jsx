import {
  Bell,
  CheckCircle2,
  LogOut,
  Menu,
  Moon,
  Shield,
  Sun,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useRealtime } from "../../hooks/useRealtime";
import { useTheme } from "../../hooks/useTheme";
import { formatCurrency } from "../../utils/formatters";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardNotifications } from "../../services/dashboardService";

export default function Topbar({ onMenuClick }) {
  const profileRef = useRef(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { logout, auth } = useAuth();
  const realtime = useRealtime();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  useEffect(() => {
    async function loadNotifications() {
      const notifications = await getDashboardNotifications();
      setUnreadCount(notifications.filter((n) => !n.isRead).length);
    }

    loadNotifications();
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white dark:border-[#2A2E32] dark:bg-[#141719]">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 dark:border-[#2A2E32] dark:bg-[#181B1D] dark:text-[#F1F3F5] dark:hover:bg-[#1D2023] lg:hidden"
          >
            <Menu size={18} />
          </button>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-[#F1F3F5]">
              Indian Stocks
            </h2>

            <p className="text-xs text-slate-500 dark:text-[#9AA1A9]">
              {realtime?.latestStock
                ? `${realtime.latestStock.symbol} • ${formatCurrency(
                    realtime.latestStock.currentPrice
                  )}`
                : "Live portfolio tracking"}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2.5">
          {realtime?.latestAlert && (
            <div className="hidden items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400 md:flex">
              <Bell size={14} />
              Alert Triggered
            </div>
          )}

          {/* Notifications */}
          <button
            onClick={() => navigate("/notifications")}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-[#2A2E32] dark:bg-[#181B1D] dark:text-[#F1F3F5] dark:hover:bg-[#1D2023]"
          >
            <Bell size={18} />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF4D5A] text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Theme */}
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-[#2A2E32] dark:bg-[#181B1D] dark:text-[#F1F3F5] dark:hover:bg-[#1D2023]"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3B82F6] text-sm font-semibold text-white">
                {auth?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <span className="hidden text-sm font-medium text-slate-700 dark:text-[#F1F3F5] md:block">
                {auth?.name}
              </span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-[#2A2E32] dark:bg-[#181B1D]">
                <div className="border-b border-slate-200 p-4 dark:border-[#2A2E32]">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#3B82F6] text-base font-semibold text-white">
                      {auth?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-slate-900 dark:text-[#F1F3F5]">
                        {auth?.name || "InvestIND User"}
                      </h3>

                      <p className="truncate text-sm text-slate-500 dark:text-[#9AA1A9]">
                        {auth?.email || "No email available"}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#00C896]/10 px-2.5 py-0.5 text-xs font-semibold text-[#00C896] border border-[#00C896]/20">
                          <CheckCircle2 size={12} />
                          Active
                        </span>

                        {auth?.role && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-[#1D2023] dark:text-[#9AA1A9] dark:border dark:border-[#2A2E32]">
                            <Shield size={12} />
                            {auth.role}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={toggleTheme}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-slate-100 dark:hover:bg-[#1D2023] dark:text-[#F1F3F5]"
                >
                  <span className="flex items-center gap-3">
                    {isDark ? <Sun size={16} /> : <Moon size={16} />}
                    {isDark ? "Switch to light mode" : "Switch to dark mode"}
                  </span>

                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-[#141719] dark:text-[#9AA1A9] dark:border dark:border-[#2A2E32]">
                    {isDark ? "Dark" : "Light"}
                  </span>
                </button>

                <button
                  onClick={logout}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[#FF4D5A] hover:bg-slate-100 dark:hover:bg-[#1D2023]"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
