package com.major.stockportfolio.websocket;

import com.major.stockportfolio.entity.Stock;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StockPricePublisher {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Send a single stock update to all subscribed clients.
     * Topic: /topic/stocks
     */
    public void publishStockUpdate(Stock stock) {
        messagingTemplate.convertAndSend("/topic/stocks", stock);
    }
}