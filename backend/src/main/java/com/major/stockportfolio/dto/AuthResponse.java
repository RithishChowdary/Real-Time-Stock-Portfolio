package com.major.stockportfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String refreshToken;
    private Long userId;
    private Long portfolioId;

    private String name;
    private String email;
    private String role;

    public AuthResponse(String token, String refreshToken, Long userId, Long portfolioId, String name, String email) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.userId = userId;
        this.portfolioId = portfolioId;
        this.name = name;
        this.email = email;
        this.role = "USER";
    }
}
