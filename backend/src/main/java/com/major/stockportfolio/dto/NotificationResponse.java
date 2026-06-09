package com.major.stockportfolio.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {

    private Long id;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
}