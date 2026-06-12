package com.major.stockportfolio.service;
import com.major.stockportfolio.dto.NotificationResponse;
import com.major.stockportfolio.dto.PortfolioPerformanceResponse;
import com.major.stockportfolio.dto.DashboardSummaryDto;
import com.major.stockportfolio.dto.HoldingResponse;

import com.major.stockportfolio.dto.RecentTransactionResponse;
import com.major.stockportfolio.entity.Portfolio;
import com.major.stockportfolio.entity.Transaction;
import com.major.stockportfolio.entity.User;
import com.major.stockportfolio.exception.ResourceNotFoundException;
import com.major.stockportfolio.exception.UnauthorizedException;
import com.major.stockportfolio.repository.AlertRepository;
import com.major.stockportfolio.repository.NotificationRepository;
import com.major.stockportfolio.repository.PortfolioRepository;
import com.major.stockportfolio.repository.TransactionRepository;
import com.major.stockportfolio.repository.UserRepository;
import com.major.stockportfolio.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final AlertRepository alertRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final PortfolioRepository portfolioRepository;

    // =========================================================
    // DASHBOARD SUMMARY API
    // =========================================================
    @Transactional
    public DashboardSummaryDto getDashboardSummary() {

        Long userId = getCurrentUser().getId();

        List<Transaction> transactions =
                transactionRepository.findByPortfolioUserId(userId);

        // 1. Total Investment
       Map<String, List<Transaction>> groupedTransactions =
        transactions.stream()
                .collect(Collectors.groupingBy(
                        tx -> tx.getStock().getSymbol()
                ));

BigDecimal totalInvestment = BigDecimal.ZERO;
BigDecimal currentValue = BigDecimal.ZERO;

for (Map.Entry<String, List<Transaction>> entry
        : groupedTransactions.entrySet()) {

    List<Transaction> txList = entry.getValue();

    int totalBuyQty = 0;
    int totalSellQty = 0;

    BigDecimal totalBuyValue = BigDecimal.ZERO;

    for (Transaction tx : txList) {

        if ("BUY".equalsIgnoreCase(tx.getTransactionType())) {

            totalBuyQty += tx.getQuantity();

            totalBuyValue = totalBuyValue.add(
                    tx.getPrice()
                            .multiply(BigDecimal.valueOf(tx.getQuantity()))
            );
        }

        if ("SELL".equalsIgnoreCase(tx.getTransactionType())) {

            totalSellQty += tx.getQuantity();
        }
    }

    int netQty = totalBuyQty - totalSellQty;

    if (netQty <= 0) {
        continue;
    }

    BigDecimal averageBuyPrice =
            totalBuyQty > 0
                    ? totalBuyValue.divide(
                            BigDecimal.valueOf(totalBuyQty),
                            4,
                            RoundingMode.HALF_UP
                    )
                    : BigDecimal.ZERO;

    BigDecimal investedValue =
            averageBuyPrice.multiply(
                    BigDecimal.valueOf(netQty)
            );

    BigDecimal stockCurrentValue =
            txList.get(0)
                    .getStock()
                    .getCurrentPrice()
                    .multiply(BigDecimal.valueOf(netQty));

    totalInvestment = totalInvestment.add(investedValue);

    currentValue = currentValue.add(stockCurrentValue);
}

        // 4. Profit/Loss
        BigDecimal totalProfitLoss =
                currentValue.subtract(totalInvestment);

        // 5. Profit/Loss %
        Double profitLossPercentage = 0.0;

        if (totalInvestment.compareTo(BigDecimal.ZERO) > 0) {
            profitLossPercentage = totalProfitLoss
                    .divide(totalInvestment, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }

        // 6. Distinct Stocks
        Integer totalStocks = (int) transactions.stream()
                .map(tx -> tx.getStock().getId())
                .distinct()
                .count();

        // 7. Active Alerts
        Integer activeAlerts = (int) alertRepository.findByUserId(userId)
                .stream()
                .filter(alert ->
                        alert.getActive() != null &&
                        alert.getActive())
                .count();

        // 8. Unread Notifications
        Integer unreadNotifications = (int) notificationRepository
                .findByUserId(userId)
                .stream()
                .filter(notification ->
                        notification.getIsRead() != null &&
                        !notification.getIsRead())
                .count();

        // 9. Return DTO
        return DashboardSummaryDto.builder()
                .totalInvestment(totalInvestment)
                .currentValue(currentValue)
                .totalProfitLoss(totalProfitLoss)
                .profitLossPercentage(profitLossPercentage)
                .totalStocks(totalStocks)
                .activeAlerts(activeAlerts)
                .unreadNotifications(unreadNotifications)
                .build();
    }

    //-----------RecentTransactionResponse----------------------//
    @Transactional
    public List<RecentTransactionResponse> getRecentTransactions() {

    Long userId = getCurrentUser().getId();

    List<Transaction> transactions =
            transactionRepository
                    .findTop10ByPortfolioUserIdOrderByTransactionDateDesc(userId);

    return transactions.stream()
            .map(tx -> RecentTransactionResponse.builder()
                    .symbol(tx.getStock().getSymbol())
                    .companyName(tx.getStock().getCompanyName())
                    .transactionType(tx.getTransactionType())
                    .quantity(tx.getQuantity())
                    .price(tx.getPrice().doubleValue())
                    .totalAmount(
                            tx.getPrice()
                                    .multiply(BigDecimal.valueOf(tx.getQuantity()))
                                    .doubleValue()
                    )
                    .transactionDate(tx.getTransactionDate())
                    .build()
            )
            .toList();
}
//---------------------PortfolioPerformance--------------------------//
@Transactional(readOnly = true)
public List<PortfolioPerformanceResponse>
getPortfolioPerformance(Long portfolioId) {

    validatePortfolioOwnership(portfolioId);

    List<Transaction> transactions =
            transactionRepository
                    .findByPortfolioId(portfolioId);

    List<PortfolioPerformanceResponse> performance =
            new ArrayList<>();

    double cumulativeValue = 0;

    for (Transaction tx : transactions) {

        double transactionValue =
                tx.getQuantity()
                * tx.getPrice().doubleValue();

        if ("BUY".equals(tx.getTransactionType())) {

            cumulativeValue += transactionValue;

        } else {

            cumulativeValue -= transactionValue;
        }

        performance.add(
                PortfolioPerformanceResponse.builder()
                        .date(
                                tx.getTransactionDate()
                                        .toLocalDate()
                        )
                        .portfolioValue(cumulativeValue)
                        .build()
        );
    }

    return performance;
}
//--------------------Notification Response---------------------------------------//

@Transactional(readOnly = true)
public List<NotificationResponse> getNotifications() {

    Long userId = getCurrentUser().getId();

    return notificationRepository.findByUserId(userId)
            .stream()
            .map(notification -> NotificationResponse.builder()
                    .id(notification.getId())
                    .message(notification.getMessage())
                    .isRead(notification.getIsRead())
                    .createdAt(notification.getCreatedAt())
                    .build()
            )
            .toList();
}
    // =========================================================
    // HOLDINGS API
    // =========================================================
    @Transactional
    public List<HoldingResponse> getHoldings() {

        Long userId = getCurrentUser().getId();

        List<Transaction> transactions =
                transactionRepository.findByPortfolioUserId(userId);

        Map<String, List<Transaction>> groupedTransactions =
                transactions.stream()
                        .collect(Collectors.groupingBy(
                                tx -> tx.getStock().getSymbol()
                        ));

        List<HoldingResponse> holdings = new ArrayList<>();

        for (Map.Entry<String, List<Transaction>> entry
                : groupedTransactions.entrySet()) {

            List<Transaction> txList = entry.getValue();
            Transaction firstTx = txList.get(0);

            int quantity = 0;
            BigDecimal totalInvestment = BigDecimal.ZERO;

            for (Transaction tx : txList) {

                BigDecimal transactionValue = tx.getPrice()
                        .multiply(BigDecimal.valueOf(tx.getQuantity()));

                if ("BUY".equalsIgnoreCase(tx.getTransactionType())) {
                    quantity += tx.getQuantity();
                    totalInvestment = totalInvestment.add(transactionValue);
                } else if ("SELL".equalsIgnoreCase(tx.getTransactionType())) {
                    quantity -= tx.getQuantity();
                }
            }

            // Skip fully sold stocks
            if (quantity <= 0) {
                continue;
            }

            BigDecimal averageBuyPrice = totalInvestment.divide(
                    BigDecimal.valueOf(quantity),
                    2,
                    RoundingMode.HALF_UP
            );

            BigDecimal currentPrice =
                    firstTx.getStock().getCurrentPrice();

            BigDecimal investedValue = averageBuyPrice.multiply(
                    BigDecimal.valueOf(quantity)
            );

            BigDecimal currentValue = currentPrice.multiply(
                    BigDecimal.valueOf(quantity)
            );

            BigDecimal profitLoss =
                    currentValue.subtract(investedValue);

            double profitLossPercentage = 0.0;

            if (investedValue.compareTo(BigDecimal.ZERO) > 0) {
                profitLossPercentage = profitLoss
                        .divide(
                                investedValue,
                                4,
                                RoundingMode.HALF_UP
                        )
                        .multiply(BigDecimal.valueOf(100))
                        .doubleValue();
            }

            holdings.add(
                    HoldingResponse.builder()
                            .symbol(firstTx.getStock().getSymbol())
                            .companyName(firstTx.getStock().getCompanyName())
                            .quantity(quantity)
                            .averagePrice(averageBuyPrice.doubleValue())
                            .currentPrice(currentPrice.doubleValue())
                            .investedValue(investedValue.doubleValue())
                            .currentValue(currentValue.doubleValue())
                            .profitLoss(profitLoss.doubleValue())
                            .profitLossPercentage(profitLossPercentage)
                            .build()
            );
        }

        return holdings;
    }

    private User getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void validatePortfolioOwnership(Long portfolioId) {
        User currentUser = getCurrentUser();

        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));

        if (!portfolio.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Access denied");
        }
    }
}
