import { createContext, useEffect, useMemo, useState } from "react";
import { createWebSocketClient } from "../services/websocketService";
import { useAuth } from "../hooks/useAuth";

export const RealtimeContext = createContext(null);

export function RealtimeProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [latestStock, setLatestStock] = useState(null);
  const [latestAlert, setLatestAlert] = useState(null);
  const [stockUpdates, setStockUpdates] = useState({});

  useEffect(() => {
    if (!isAuthenticated) return;

    const client = createWebSocketClient({
      onStockUpdate: (stock) => {
        setLatestStock(stock);
        setStockUpdates((current) => ({
          ...current,
          [stock.symbol]: stock,
        }));
      },
      onAlert: (alert) => {
        setLatestAlert(alert);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [isAuthenticated]);

  const value = useMemo(
    () => ({
      latestStock,
      latestAlert,
      stockUpdates,
    }),
    [latestStock, latestAlert, stockUpdates]
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}