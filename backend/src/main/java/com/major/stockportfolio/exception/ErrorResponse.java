package com.major.stockportfolio.exception;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ErrorResponse {

    private boolean success;

    private String message;

    private int status;

    private String path;

    private LocalDateTime timestamp;
}