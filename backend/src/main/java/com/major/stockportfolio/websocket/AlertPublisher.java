package com.major.stockportfolio.websocket;

import com.major.stockportfolio.entity.Alert;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AlertPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void publishAlert(Alert alert) {
        messagingTemplate.convertAndSend("/topic/alerts", alert);
    }
}