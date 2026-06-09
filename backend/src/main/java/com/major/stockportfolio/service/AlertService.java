package com.major.stockportfolio.service;

import com.major.stockportfolio.dto.CreateAlertRequest;
import com.major.stockportfolio.entity.Alert;
import com.major.stockportfolio.entity.Notification;
import com.major.stockportfolio.entity.Stock;
import com.major.stockportfolio.entity.User;
import com.major.stockportfolio.exception.ResourceNotFoundException;
import com.major.stockportfolio.repository.AlertRepository;
import com.major.stockportfolio.repository.NotificationRepository;
import com.major.stockportfolio.repository.StockRepository;
import com.major.stockportfolio.repository.UserRepository;
import com.major.stockportfolio.util.SecurityUtils;
import com.major.stockportfolio.websocket.AlertPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;
    private final StockRepository stockRepository;
    private final NotificationRepository notificationRepository;
    private final AlertPublisher alertPublisher;

    // CREATE ALERT
    public Alert createAlert(CreateAlertRequest request) {

        User user = getCurrentUser();

        Stock stock = stockRepository.findById(request.getStockId())
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found"));

        Alert alert = Alert.builder()
                .user(user)
                .stock(stock)
                .targetPrice(request.getTargetPrice())
                .stopLoss(request.getStopLoss())
                .profitPercentage(request.getProfitPercentage())
                .lossPercentage(request.getLossPercentage())
                .active(true)
                .build();

        return alertRepository.save(alert);
    }

    // GET USER ALERTS
    public List<Alert> getUserAlerts() {
        return alertRepository.findByUser(getCurrentUser());
    }

    // CHECK ALERTS
    @Transactional
    public void checkAlerts(Stock stock) {

        List<Alert> alerts =
                alertRepository.findByStockAndActiveTrue(stock);

        log.info("Found alerts: {}", alerts.size());

        for (Alert alert : alerts) {

            boolean triggered = false;

            log.info("Checking alert ID: {}", alert.getId());

            log.info("Current Price: {}", stock.getCurrentPrice());

            log.info("Target Price: {}", alert.getTargetPrice());

            // TARGET PRICE CHECK
            if (alert.getTargetPrice() != null &&
                    stock.getCurrentPrice()
                            .compareTo(alert.getTargetPrice()) >= 0) {

                triggered = true;

                log.info("TARGET PRICE TRIGGERED");
            }

            // STOP LOSS CHECK
            if (alert.getStopLoss() != null &&
                    stock.getCurrentPrice()
                            .compareTo(alert.getStopLoss()) <= 0) {

                triggered = true;

                log.info("STOP LOSS TRIGGERED");
            }

            if (triggered) {

                Notification notification =
                        Notification.builder()
                                .user(alert.getUser())
                                .message(
                                        stock.getSymbol()
                                                + " crossed alert price at ₹"
                                                + stock.getCurrentPrice()
                                )
                                .isRead(false)
                                .createdAt(LocalDateTime.now())
                                .build();

                notificationRepository.save(notification);

                alert.setActive(false);

                alertRepository.save(alert);

                alertPublisher.publishAlert(alert);

                log.info("Notification saved successfully!");

            } else {

                log.info("Alert NOT triggered");
            }
        }
    }

    private User getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
