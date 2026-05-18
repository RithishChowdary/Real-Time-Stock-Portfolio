package com.major.stockportfolio.service;

import com.major.stockportfolio.dto.CreateAlertRequest;
import com.major.stockportfolio.entity.Alert;
import com.major.stockportfolio.entity.Stock;
import com.major.stockportfolio.entity.User;
import com.major.stockportfolio.repository.AlertRepository;
import com.major.stockportfolio.repository.StockRepository;
import com.major.stockportfolio.repository.UserRepository;
import com.major.stockportfolio.websocket.AlertPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;
    private final StockRepository stockRepository;
    private final AlertPublisher alertPublisher;

    public Alert createAlert(CreateAlertRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Stock stock = stockRepository.findById(request.getStockId())
                .orElseThrow(() -> new RuntimeException("Stock not found"));

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

    public List<Alert> getUserAlerts(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return alertRepository.findByUser(user);
    }

    public void checkAlerts(Stock stock) {

        List<Alert> alerts =
                alertRepository.findByStockAndActiveTrue(stock);

        for (Alert alert : alerts) {

            boolean triggered = false;

            if (alert.getTargetPrice() != null &&
                    stock.getCurrentPrice().compareTo(alert.getTargetPrice()) >= 0) {
                triggered = true;
            }

            if (alert.getStopLoss() != null &&
                    stock.getCurrentPrice().compareTo(alert.getStopLoss()) <= 0) {
                triggered = true;
            }

            if (triggered) {
                alert.setActive(false);
                alertRepository.save(alert);
                alertPublisher.publishAlert(alert);
            }
        }
    }
}