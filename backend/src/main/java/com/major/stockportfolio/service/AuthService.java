package com.major.stockportfolio.service;

import com.major.stockportfolio.dto.AuthResponse;
import com.major.stockportfolio.dto.LoginRequest;
import com.major.stockportfolio.dto.RefreshTokenRequest;
import com.major.stockportfolio.dto.RegisterRequest;
import com.major.stockportfolio.entity.Portfolio;
import com.major.stockportfolio.entity.User;
import com.major.stockportfolio.repository.PortfolioRepository;
import com.major.stockportfolio.repository.UserRepository;
import com.major.stockportfolio.security.JwtUtil;
import com.major.stockportfolio.exception.DuplicateResourceException;
import com.major.stockportfolio.exception.ResourceNotFoundException;
import com.major.stockportfolio.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PortfolioRepository portfolioRepository;
    private final PaperTradingAccountService paperTradingAccountService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        log.info("Registering new user: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            log.error("Email already exists: {}", request.getEmail());
            throw new DuplicateResourceException("Email already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("USER")
                .build();

        userRepository.save(user);

        String token = jwtUtil.generateAccessToken(user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        Portfolio portfolio = getOrCreatePortfolioForUser(user);
        paperTradingAccountService.getOrCreateAccountForUser(user);

        log.info("User registered successfully: {}", user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .portfolioId(portfolio.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public AuthResponse login(LoginRequest request) {

        log.info("Attempting login for user: {}", request.getEmail());

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (AuthenticationException ex) {
            log.error("Authentication failed for user: {}", request.getEmail(), ex);
            throw new UnauthorizedException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        String token = jwtUtil.generateAccessToken(request.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(request.getEmail());

        Portfolio portfolio = getOrCreatePortfolioForUser(user);
        paperTradingAccountService.getOrCreateAccountForUser(user);

        log.info("User logged in successfully: {}", request.getEmail());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .portfolioId(portfolio.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {

        String email = jwtUtil.extractUsername(request.getRefreshToken());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        if (!jwtUtil.isRefreshTokenValid(request.getRefreshToken(), user.getEmail())) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        Portfolio portfolio = getOrCreatePortfolioForUser(user);

        return AuthResponse.builder()
                .token(jwtUtil.generateAccessToken(user.getEmail()))
                .refreshToken(jwtUtil.generateRefreshToken(user.getEmail()))
                .userId(user.getId())
                .portfolioId(portfolio.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    private Portfolio getOrCreatePortfolioForUser(User user) {
        return portfolioRepository.findByUser(user)
                .stream()
                .findFirst()
                .orElseGet(() -> {
                    Portfolio portfolio = Portfolio.builder()
                            .portfolioName("Default Portfolio")
                            .user(user)
                            .build();
                    return portfolioRepository.save(portfolio);
                });
    }
}
