import {
  Bell,
  CheckCircle2,
  LogOut,
  Menu,
  Moon,
  Search,
  Shield,
  Sun,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useRealtime } from "../../hooks/useRealtime";
import { useTheme } from "../../hooks/useTheme";
import { formatCurrency } from "../../utils/formatters";
import { useEffect, useRef, useState } from "react";
import { searchStocks } from "../../services/stockService";
import { useNavigate } from "react-router-dom";
import { getDashboardNotifications } from "../../services/dashboardService";

export default function Topbar({ onMenuClick }) {
  const profileRef = useRef(null);

  const [profileOpen, setProfileOpen] = useState(false);
const [searchTerm, setSearchTerm] = useState("");
const [searchResults, setSearchResults] = useState([]);
const [showSearch, setShowSearch] = useState(false);
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
  const timer = setTimeout(async () => {
    if (searchTerm.trim().length < 1) {
      setSearchResults([]);
      return;
    }

    try {
      const data = await searchStocks(searchTerm);
      setSearchResults(data.slice(0, 5));
    } catch {
      setSearchResults([]);
    }
  }, 300);

  return () => clearTimeout(timer);
}, [searchTerm]);

  useEffect(() => {

  async function loadNotifications() {

    const notifications =
      await getDashboardNotifications();

    setUnreadCount(
      notifications.filter(
        n => !n.isRead
      ).length
    );
  }

  loadNotifications();

  const interval =
    setInterval(loadNotifications, 5000);

  return () =>
    clearInterval(interval);

}, []);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 lg:hidden"
          >
            <Menu size={18} />
          </button>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Indian Stocks
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {realtime?.latestStock
                ? `${realtime.latestStock.symbol} • ${formatCurrency(
                    realtime.latestStock.currentPrice
                  )}`
                : "Live portfolio tracking"}
            </p>
          </div>
        </div>

       {/* Search */}
<div className="hidden flex-1 justify-center px-6 lg:flex">
  <div className="relative w-full max-w-sm">
    <Search
      size={16}
      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
    />

    <input
      type="text"
      placeholder="Search stocks..."
      value={searchTerm}
      onFocus={() => setShowSearch(true)}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
    />

    {showSearch && searchResults.length > 0 && (
      <div className="absolute top-12 z-50 w-full rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
        {searchResults.map((stock) => (
          <button
            key={stock.id}
            onClick={() => {
              navigate(`/stocks?search=${stock.symbol}`);
              setShowSearch(false);
              setSearchTerm("");
            }}
            className="block w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
          >
            <div className="font-semibold">
              {stock.symbol}
            </div>

            <div className="text-xs text-slate-500">
              {stock.companyName}
            </div>
          </button>
        ))}
      </div>
    )}
  </div>
</div>
    
        {/* Right */}
        <div className="flex items-center gap-2">

          {realtime?.latestAlert && (
            <div className="hidden items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300 md:flex">
              <Bell size={14} />
              Alert Triggered
            </div>
          )}

          {/* Notifications */}
          <button
            onClick={() => navigate("/notifications")}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
          >
            <Bell size={18} />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Theme */}
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            {isDark ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )}
          </button>

          {/* Profile */}
          <div
            ref={profileRef}
            className="relative"
          >
            <button
              onClick={() =>
                setProfileOpen(!profileOpen)
              }
              className="flex items-center gap-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {auth?.name
                  ?.charAt(0)
                  ?.toUpperCase() || "U"}
              </div>

              <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-300 md:block">
                {auth?.name}
              </span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30">

                <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-base font-semibold text-white">
                      {auth?.name
                        ?.charAt(0)
                        ?.toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-slate-900 dark:text-white">
                        {auth?.name || "InvestIND User"}
                      </h3>

                      <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                        {auth?.email || "No email available"}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400">
                          <CheckCircle2 size={12} />
                          Active
                        </span>

                        {auth?.role && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
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
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <span className="flex items-center gap-3">
                    {isDark ? (
                      <Sun size={16} />
                    ) : (
                      <Moon size={16} />
                    )}

                    {isDark
                      ? "Switch to light mode"
                      : "Switch to dark mode"}
                  </span>

                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {isDark ? "Dark" : "Light"}
                  </span>
                </button>

                <button
                  onClick={logout}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
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
