package com.major.stockportfolio.service;

import com.major.stockportfolio.dto.BuyStockRequest;
import com.major.stockportfolio.dto.HoldingResponse;
import com.major.stockportfolio.dto.PortfolioSummaryResponse;
import com.major.stockportfolio.dto.SellStockRequest;
import com.major.stockportfolio.dto.TransactionResponse;
import com.major.stockportfolio.entity.Portfolio;
import com.major.stockportfolio.entity.Stock;
import com.major.stockportfolio.entity.Transaction;
import com.major.stockportfolio.repository.PortfolioRepository;
import com.major.stockportfolio.repository.StockRepository;
import com.major.stockportfolio.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final PortfolioRepository portfolioRepository;
    private final StockRepository stockRepository;

    // Return All Transactions
    public List<Transaction> getAllTransactions() {
    return transactionRepository.findAll();
}
    // =====================================================
    // BUY STOCK
    // =====================================================
    @Transactional
    public TransactionResponse buyStock(BuyStockRequest request) {

        Portfolio portfolio = portfolioRepository.findById(request.getPortfolioId())
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));

        Stock stock = stockRepository.findBySymbol(request.getSymbol())
                .orElseThrow(() -> new RuntimeException("Stock not found"));

        Transaction transaction = Transaction.builder()
                .portfolio(portfolio)
                .stock(stock)
                .quantity(request.getQuantity())
                .price(BigDecimal.valueOf(request.getPrice()))
                .transactionType("BUY")
                .transactionDate(LocalDateTime.now())
                .build();

        Transaction saved = transactionRepository.save(transaction);

        return TransactionResponse.builder()
                .id(saved.getId())
                .symbol(saved.getStock().getSymbol())
                .companyName(saved.getStock().getCompanyName())
                .quantity(saved.getQuantity())
                .price(saved.getPrice().doubleValue())
                .transactionType(saved.getTransactionType())
                .transactionDate(saved.getTransactionDate())
                .build();
    }

    // =====================================================
    // SELL STOCK
    // =====================================================
    @Transactional
    public TransactionResponse sellStock(SellStockRequest request) {

        Portfolio portfolio = portfolioRepository.findById(request.getPortfolioId())
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));

        Stock stock = stockRepository.findBySymbol(request.getSymbol())
                .orElseThrow(() -> new RuntimeException("Stock not found"));

        int availableQty = getNetQuantity(portfolio.getId(), stock.getSymbol());

        if (availableQty < request.getQuantity()) {
            throw new RuntimeException(
                    "Insufficient quantity to sell. Available quantity: " + availableQty
            );
        }

        Transaction transaction = Transaction.builder()
                .portfolio(portfolio)
                .stock(stock)
                .quantity(request.getQuantity())
                .price(BigDecimal.valueOf(request.getPrice()))
                .transactionType("SELL")
                .transactionDate(LocalDateTime.now())
                .build();

        Transaction saved = transactionRepository.save(transaction);

        return TransactionResponse.builder()
                .id(saved.getId())
                .symbol(saved.getStock().getSymbol())
                .companyName(saved.getStock().getCompanyName())
                .quantity(saved.getQuantity())
                .price(saved.getPrice().doubleValue())
                .transactionType(saved.getTransactionType())
                .transactionDate(saved.getTransactionDate())
                .build();
    }

    // =====================================================
    // GET HOLDINGS
    // =====================================================
    @Transactional(readOnly = true)
    public List<HoldingResponse> getHoldings(Long portfolioId) {

        List<Transaction> transactions =
                transactionRepository.findByPortfolioId(portfolioId);

        Map<String, List<Transaction>> grouped =
                transactions.stream()
                        .collect(Collectors.groupingBy(
                                tx -> tx.getStock().getSymbol()
                        ));

        List<HoldingResponse> holdings = new ArrayList<>();

        for (Map.Entry<String, List<Transaction>> entry : grouped.entrySet()) {

            List<Transaction> txs = entry.getValue();
            Stock stock = txs.get(0).getStock();

            int totalBuyQty = 0;
            int totalSellQty = 0;
            double totalBuyValue = 0.0;

            for (Transaction tx : txs) {

                if ("BUY".equals(tx.getTransactionType())) {
                    totalBuyQty += tx.getQuantity();
                    totalBuyValue +=
                            tx.getQuantity() * tx.getPrice().doubleValue();
                }

                if ("SELL".equals(tx.getTransactionType())) {
                    totalSellQty += tx.getQuantity();
                }
            }

            int netQty = totalBuyQty - totalSellQty;

            // Skip fully sold positions
            if (netQty <= 0) {
                continue;
            }

            // Average buy price based only on BUY transactions
            double avgBuyPrice = totalBuyQty > 0
                    ? totalBuyValue / totalBuyQty
                    : 0;

            double investedValue = netQty * avgBuyPrice;
            double currentPrice = stock.getCurrentPrice().doubleValue();
            double currentValue = netQty * currentPrice;
            double profitLoss = currentValue - investedValue;

            double profitPct = investedValue > 0
                    ? (profitLoss / investedValue) * 100
                    : 0;

            holdings.add(
                    HoldingResponse.builder()
                            .symbol(stock.getSymbol())
                            .companyName(stock.getCompanyName())
                            .quantity(netQty)
                            .averagePrice(avgBuyPrice)
                            .currentPrice(currentPrice)
                            .investedValue(investedValue)
                            .currentValue(currentValue)
                            .profitLoss(profitLoss)
                            .profitLossPercentage(profitPct)
                            .build()
            );
        }

        return holdings;
    }

    // =====================================================
    // GET PORTFOLIO SUMMARY
    // =====================================================
    @Transactional(readOnly = true)
    public PortfolioSummaryResponse getPortfolioSummary(Long portfolioId) {

        List<HoldingResponse> holdings = getHoldings(portfolioId);

        double totalInvestment = holdings.stream()
                .mapToDouble(HoldingResponse::getInvestedValue)
                .sum();

        double currentValue = holdings.stream()
                .mapToDouble(HoldingResponse::getCurrentValue)
                .sum();

        double totalProfitLoss = currentValue - totalInvestment;

        double returnPercentage = totalInvestment > 0
                ? (totalProfitLoss / totalInvestment) * 100
                : 0;

        return PortfolioSummaryResponse.builder()
                .totalInvestment(totalInvestment)
                .currentValue(currentValue)
                .totalProfitLoss(totalProfitLoss)
                .returnPercentage(returnPercentage)
                .build();
    }

    // =====================================================
    // HELPER METHOD
    // =====================================================
    @Transactional(readOnly = true)
    private int getNetQuantity(Long portfolioId, String symbol) {

        return getHoldings(portfolioId).stream()
                .filter(h -> h.getSymbol().equals(symbol))
                .map(HoldingResponse::getQuantity)
                .findFirst()
                .orElse(0);
    }
}