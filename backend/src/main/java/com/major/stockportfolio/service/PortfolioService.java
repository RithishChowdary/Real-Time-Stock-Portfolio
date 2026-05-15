package com.major.stockportfolio.service;

import com.major.stockportfolio.dto.PortfolioRequest;
import com.major.stockportfolio.dto.PortfolioResponse;
import com.major.stockportfolio.dto.UserSummaryResponse;
import com.major.stockportfolio.entity.Portfolio;
import com.major.stockportfolio.entity.User;
import com.major.stockportfolio.repository.PortfolioRepository;
import com.major.stockportfolio.repository.UserRepository;
import com.major.stockportfolio.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor

public class PortfolioService {


    private final PortfolioRepository portfolioRepository;
    private final UserRepository userRepository;

    public PortfolioResponse createPortfolio(PortfolioRequest request) {
        User user = getCurrentUser();

        Portfolio portfolio = Portfolio.builder()
                .portfolioName(request.getPortfolioName())
                .user(user)
                .build();

        Portfolio saved = portfolioRepository.save(portfolio);
        return mapToResponse(saved);
    }
    
  public List<PortfolioResponse> getMyPortfolios() {
    User user = getCurrentUser();

    return portfolioRepository.findByUser(user)
            .stream()
            .map(this::mapToResponse)
            .toList();
}

    public PortfolioResponse getPortfolioById(Long id) {
        Portfolio portfolio = getUserOwnedPortfolio(id);
        return mapToResponse(portfolio);
    }

    public PortfolioResponse updatePortfolio(Long id, PortfolioRequest request) {
        Portfolio portfolio = getUserOwnedPortfolio(id);
        portfolio.setPortfolioName(request.getPortfolioName());

        Portfolio updated = portfolioRepository.save(portfolio);
        return mapToResponse(updated);
    }

    public void deletePortfolio(Long id) {
        Portfolio portfolio = getUserOwnedPortfolio(id);
        portfolioRepository.delete(portfolio);
    }
    private User getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Portfolio getUserOwnedPortfolio(Long id) {
    User currentUser = getCurrentUser();

    Portfolio portfolio = portfolioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Portfolio not found"));

    if (!portfolio.getUser().getId().equals(currentUser.getId())) {
        throw new RuntimeException("Access denied");
    }

    return portfolio;
}
private PortfolioResponse mapToResponse(Portfolio portfolio) {
    return PortfolioResponse.builder()
            .id(portfolio.getId())
            .portfolioName(portfolio.getPortfolioName())
            .createdAt(portfolio.getCreatedAt())
            .user(UserSummaryResponse.builder()
                    .id(portfolio.getUser().getId())
                    .name(portfolio.getUser().getName())
                    .email(portfolio.getUser().getEmail())
                    .build())
            .build();

    }
}

