package com.major.stockportfolio.security;

import com.major.stockportfolio.entity.User;
import com.major.stockportfolio.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    // Replace with your Google email
    private static final String ADMIN_EMAIL = "rithishchowdary783@gmail.com";

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");

        Optional<User> existingUser = userRepository.findByEmail(email);

        User user;

        if (existingUser.isPresent()) {

            user = existingUser.get();

            // Upgrade owner account to ADMIN
            if (email.equalsIgnoreCase(ADMIN_EMAIL)
                    && !"ADMIN".equalsIgnoreCase(user.getRole())) {

                user.setRole("ADMIN");
                user = userRepository.save(user);
            }

        } else {

            String role = email.equalsIgnoreCase(ADMIN_EMAIL)
                    ? "ADMIN"
                    : "USER";

            user = User.builder()
                    .name(name)
                    .email(email)
                    .password("GOOGLE_LOGIN")
                    .role(role)
                    .build();

            user = userRepository.save(user);
        }

        String token = jwtUtil.generateToken(user.getEmail());

        response.sendRedirect(
                "http://localhost:5173/oauth-success?token=" + token
        );
    }
}