package com.major.stockportfolio.quantitative.risk.service;

import com.major.stockportfolio.entity.PaperTradingAccount;
import com.major.stockportfolio.entity.Stock;
import com.major.stockportfolio.entity.Transaction;
import com.major.stockportfolio.entity.User;
import com.major.stockportfolio.exception.ResourceNotFoundException;
import com.major.stockportfolio.quantitative.ai.service.AIAnalysisService;
import com.major.stockportfolio.quantitative.risk.dto.PortfolioRiskAIResponse;
import com.major.stockportfolio.quantitative.risk.dto.PortfolioRiskAnalysisResponse;
import com.major.stockportfolio.quantitative.risk.dto.PortfolioRiskMetrics;
import com.major.stockportfolio.quantitative.risk.dto.PositionExposure;
import com.major.stockportfolio.repository.TransactionRepository;
import com.major.stockportfolio.repository.UserRepository;
import com.major.stockportfolio.service.PaperTradingAccountService;
import com.major.stockportfolio.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PortfolioRiskService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final PaperTradingAccountService paperTradingAccountService;
    private final AIAnalysisService aiAnalysisService;

    @Transactional(readOnly = true)
    public PortfolioRiskMetrics calculatePortfolioRisk() {
        User currentUser = getCurrentUser();
        return calculateRiskMetricsForUser(currentUser);
    }

    @Transactional
    public PortfolioRiskAnalysisResponse analyzePortfolioRisk() {
        User currentUser = getCurrentUser();
        PortfolioRiskMetrics metrics = calculateRiskMetricsForUser(currentUser);
        PortfolioRiskAIResponse aiAssessment = aiAnalysisService.analyzePortfolioRisk(metrics);

        return PortfolioRiskAnalysisResponse.builder()
                .metrics(metrics)
                .aiAssessment(aiAssessment)
                .analyzedAt(LocalDateTime.now())
                .build();
    }

    public PortfolioRiskMetrics calculateRiskMetricsForUser(User user) {
        // 1. Account & Available Cash
        PaperTradingAccount account = paperTradingAccountService.getOrCreateAccountForUser(user);
        BigDecimal availableCash = account.getAvailableCash() != null ? account.getAvailableCash() : BigDecimal.ZERO;

        // 2. Fetch User Transactions
        List<Transaction> transactions = transactionRepository.findByPortfolioUserId(user.getId());

        // 3. Group and Calculate Net Positions
        Map<String, List<Transaction>> groupedByStock = transactions.stream()
                .filter(tx -> tx.getStock() != null && tx.getStock().getSymbol() != null)
                .collect(Collectors.groupingBy(tx -> tx.getStock().getSymbol()));

        BigDecimal totalInvestment = BigDecimal.ZERO;
        BigDecimal totalHoldingsValue = BigDecimal.ZERO;
        List<PositionExposure> rawExposures = new ArrayList<>();

        for (Map.Entry<String, List<Transaction>> entry : groupedByStock.entrySet()) {
            List<Transaction> txList = entry.getValue();
            Stock stock = txList.get(0).getStock();

            int totalBuyQty = 0;
            int totalSellQty = 0;
            BigDecimal totalBuyCost = BigDecimal.ZERO;

            for (Transaction tx : txList) {
                if ("BUY".equalsIgnoreCase(tx.getTransactionType())) {
                    totalBuyQty += tx.getQuantity();
                    BigDecimal cost = tx.getPrice().multiply(BigDecimal.valueOf(tx.getQuantity()));
                    totalBuyCost = totalBuyCost.add(cost);
                } else if ("SELL".equalsIgnoreCase(tx.getTransactionType())) {
                    totalSellQty += tx.getQuantity();
                }
            }

            int netQty = totalBuyQty - totalSellQty;
            if (netQty <= 0) {
                continue; // Position is closed
            }

            BigDecimal averageBuyPrice = totalBuyQty > 0
                    ? totalBuyCost.divide(BigDecimal.valueOf(totalBuyQty), 4, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            BigDecimal currentPrice = stock.getCurrentPrice() != null
                    ? stock.getCurrentPrice()
                    : averageBuyPrice;

            BigDecimal investedValue = averageBuyPrice.multiply(BigDecimal.valueOf(netQty));
            BigDecimal currentValue = currentPrice.multiply(BigDecimal.valueOf(netQty));
            BigDecimal profitLoss = currentValue.subtract(investedValue);

            double returnPct = 0.0;
            if (investedValue.compareTo(BigDecimal.ZERO) > 0) {
                returnPct = profitLoss.divide(investedValue, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .doubleValue();
            }

            totalInvestment = totalInvestment.add(investedValue);
            totalHoldingsValue = totalHoldingsValue.add(currentValue);

            rawExposures.add(PositionExposure.builder()
                    .symbol(stock.getSymbol())
                    .companyName(stock.getCompanyName() != null ? stock.getCompanyName() : stock.getSymbol())
                    .quantity(netQty)
                    .averagePrice(averageBuyPrice.setScale(2, RoundingMode.HALF_UP))
                    .currentPrice(currentPrice.setScale(2, RoundingMode.HALF_UP))
                    .investedValue(investedValue.setScale(2, RoundingMode.HALF_UP))
                    .currentValue(currentValue.setScale(2, RoundingMode.HALF_UP))
                    .profitLoss(profitLoss.setScale(2, RoundingMode.HALF_UP))
                    .returnPercentage(returnPct)
                    .exposurePercentage(0.0) // Will calculate after total portfolio value
                    .build());
        }

        // 4. Portfolio Totals & Exposure Weights
        BigDecimal totalPortfolioValue = availableCash.add(totalHoldingsValue);
        BigDecimal totalProfitLoss = totalHoldingsValue.subtract(totalInvestment);

        double totalReturnPct = 0.0;
        if (totalInvestment.compareTo(BigDecimal.ZERO) > 0) {
            totalReturnPct = totalProfitLoss.divide(totalInvestment, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }

        double cashAllocationPct = 100.0;
        if (totalPortfolioValue.compareTo(BigDecimal.ZERO) > 0) {
            cashAllocationPct = availableCash.divide(totalPortfolioValue, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }

        // Calculate exposure % for each holding
        final BigDecimal finalPortfolioValue = totalPortfolioValue;
        List<PositionExposure> finalExposures = rawExposures.stream()
                .map(exp -> {
                    double expPct = 0.0;
                    if (finalPortfolioValue.compareTo(BigDecimal.ZERO) > 0) {
                        expPct = exp.getCurrentValue().divide(finalPortfolioValue, 4, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100))
                                .doubleValue();
                    }
                    exp.setExposurePercentage(expPct);
                    return exp;
                })
                .sorted(Comparator.comparing(PositionExposure::getCurrentValue).reversed())
                .collect(Collectors.toList());

        // 5. Concentration & Largest Holding
        int numberOfHoldings = finalExposures.size();
        String largestHoldingSymbol = "NONE";
        BigDecimal largestHoldingValue = BigDecimal.ZERO;
        double largestHoldingPercentage = 0.0;

        if (numberOfHoldings > 0) {
            PositionExposure topExp = finalExposures.get(0);
            largestHoldingSymbol = topExp.getSymbol();
            largestHoldingValue = topExp.getCurrentValue();
            largestHoldingPercentage = topExp.getExposurePercentage();
        }

        // 6. Deterministic Educational Risk Scoring (0 to 100)
        List<String> riskFactors = new ArrayList<>();
        int riskScore = calculateDeterministicRiskScore(
                numberOfHoldings,
                largestHoldingSymbol,
                largestHoldingPercentage,
                cashAllocationPct,
                totalReturnPct,
                riskFactors
        );

        String riskLevel;
        if (riskScore <= 30) {
            riskLevel = "LOW";
        } else if (riskScore <= 60) {
            riskLevel = "MODERATE";
        } else if (riskScore <= 80) {
            riskLevel = "HIGH";
        } else {
            riskLevel = "VERY HIGH";
        }

        return PortfolioRiskMetrics.builder()
                .totalPortfolioValue(totalPortfolioValue.setScale(2, RoundingMode.HALF_UP))
                .availableCash(availableCash.setScale(2, RoundingMode.HALF_UP))
                .holdingsValue(totalHoldingsValue.setScale(2, RoundingMode.HALF_UP))
                .totalInvestment(totalInvestment.setScale(2, RoundingMode.HALF_UP))
                .profitLoss(totalProfitLoss.setScale(2, RoundingMode.HALF_UP))
                .returnPercentage(totalReturnPct)
                .numberOfHoldings(numberOfHoldings)
                .largestHoldingSymbol(largestHoldingSymbol)
                .largestHoldingValue(largestHoldingValue.setScale(2, RoundingMode.HALF_UP))
                .largestHoldingPercentage(largestHoldingPercentage)
                .cashAllocationPercentage(cashAllocationPct)
                .riskScore(riskScore)
                .riskLevel(riskLevel)
                .riskFactors(riskFactors)
                .positionExposures(finalExposures)
                .calculatedAt(LocalDateTime.now())
                .build();
    }

    /**
     * Deterministic Java risk scoring methodology (Educational platform metric).
     * Range: 0 to 100
     */
    public int calculateDeterministicRiskScore(
            int numberOfHoldings,
            String largestHoldingSymbol,
            double largestHoldingPercentage,
            double cashAllocationPct,
            double totalReturnPct,
            List<String> riskFactors
    ) {
        if (numberOfHoldings == 0) {
            riskFactors.add("100% Cash allocation — Zero equity volatility and zero market drawdown risk.");
            riskFactors.add("Cash drag — Portfolio is not participating in Indian equity market capital growth.");
            return 10; // Low risk score for pure cash
        }

        int score = 20; // Base score for active market participation

        // Factor 1: Single-Stock Concentration
        if (largestHoldingPercentage >= 50.0) {
            score += 30;
            riskFactors.add("High single-stock concentration: " + largestHoldingSymbol +
                    " represents " + String.format("%.1f", largestHoldingPercentage) + "% of total portfolio value.");
        } else if (largestHoldingPercentage >= 35.0) {
            score += 20;
            riskFactors.add("Elevated concentration: " + largestHoldingSymbol +
                    " constitutes " + String.format("%.1f", largestHoldingPercentage) + "% of total portfolio.");
        } else if (largestHoldingPercentage >= 20.0) {
            score += 10;
        } else {
            score += 4;
            riskFactors.add("Balanced asset distribution: No single position exceeds 20% of portfolio value.");
        }

        // Factor 2: Number of Holdings (Diversification)
        if (numberOfHoldings == 1) {
            score += 25;
            riskFactors.add("Extreme single-asset reliance (only 1 active equity position).");
        } else if (numberOfHoldings == 2) {
            score += 18;
            riskFactors.add("Low portfolio diversification (2 active equity positions).");
        } else if (numberOfHoldings <= 4) {
            score += 10;
            riskFactors.add("Moderate diversification across " + numberOfHoldings + " equity positions.");
        } else {
            score += 3;
            riskFactors.add("Broad portfolio diversification across " + numberOfHoldings + " active positions.");
        }

        // Factor 3: Cash Buffer / Liquidity Protection
        if (cashAllocationPct < 5.0) {
            score += 15;
            riskFactors.add("Low liquidity buffer: Available cash is under 5% of portfolio value.");
        } else if (cashAllocationPct < 15.0) {
            score += 8;
        } else if (cashAllocationPct >= 60.0) {
            riskFactors.add("High cash buffer (" + String.format("%.1f", cashAllocationPct) + "% cash) provides strong downside protection.");
        } else {
            riskFactors.add("Healthy liquidity: Cash represents " + String.format("%.1f", cashAllocationPct) + "% of total portfolio.");
        }

        // Factor 4: Portfolio Return / Drawdown
        if (totalReturnPct <= -10.0) {
            score += 12;
            riskFactors.add("Active portfolio drawdown: Current unrealized return is " + String.format("%.2f", totalReturnPct) + "%.");
        } else if (totalReturnPct < 0.0) {
            score += 5;
        } else if (totalReturnPct >= 5.0) {
            score -= 5;
            riskFactors.add("Positive net equity returns: +" + String.format("%.2f", totalReturnPct) + "% overall return.");
        }

        // Clamp between 5 and 95
        return Math.max(5, Math.min(95, score));
    }

    private User getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
