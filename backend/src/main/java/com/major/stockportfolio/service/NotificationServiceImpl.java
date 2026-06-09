package com.major.stockportfolio.service;

import com.major.stockportfolio.entity.Notification;
import com.major.stockportfolio.interfaces.NotificationService;
import com.major.stockportfolio.repository.NotificationRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl
        implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public List<Notification> getNotifications(Long userId) {
        return notificationRepository.findByUserId(userId);
    }

    @Override
    public Notification markAsRead(Long notificationId) {

        Notification notification =
                notificationRepository.findById(notificationId)
                        .orElseThrow();

        notification.setIsRead(true);

        return notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead(Long userId) {

        List<Notification> notifications =
                notificationRepository.findByUserId(userId);

        notifications.forEach(
                notification ->
                        notification.setIsRead(true)
        );

        notificationRepository.saveAll(notifications);
    }
}