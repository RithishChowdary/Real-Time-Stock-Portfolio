package com.major.stockportfolio.interfaces;

import com.major.stockportfolio.entity.Notification;

import java.util.List;

public interface NotificationService {

    List<Notification> getNotifications(Long userId);

    Notification markAsRead(Long notificationId);

    void markAllAsRead(Long userId);
}