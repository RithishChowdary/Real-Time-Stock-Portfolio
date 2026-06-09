import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export function createWebSocketClient({ onStockUpdate, onAlert }) {
  const client = new Client({
    webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL),
    reconnectDelay: 5000,
    onConnect: () => {
      client.subscribe("/topic/stocks", (message) => {
        onStockUpdate?.(JSON.parse(message.body));
      });

      client.subscribe("/topic/alerts", (message) => {
        onAlert?.(JSON.parse(message.body));
      });
    },
  });

  return client;
}