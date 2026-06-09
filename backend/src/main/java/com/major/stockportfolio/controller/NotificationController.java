package com.major.stockportfolio.controller;

import com.major.stockportfolio.entity.Notification;
import com.major.stockportfolio.interfaces.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/{userId}")
    public List<Notification> getNotifications(
            @PathVariable Long userId
    ) {
        return notificationService.getNotifications(userId);
    }

    @PutMapping("/{id}/read")
    public Notification markAsRead(
            @PathVariable Long id
    ) {
        return notificationService.markAsRead(id);
    }

    @PutMapping("/user/{userId}/read-all")
    public void markAllAsRead(
            @PathVariable Long userId
    ) {
        notificationService.markAllAsRead(userId);
    }
}