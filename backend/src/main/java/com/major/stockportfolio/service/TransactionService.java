package com.major.stockportfolio.service;

import com.major.stockportfolio.dto.BuyStockRequest;
import com.major.stockportfolio.dto.HoldingResponse;
import com.major.stockportfolio.dto.PortfolioSummaryResponse;
import com.major.stockportfolio.dto.SellStockRequest;
import com.major.stockportfolio.dto.TransactionResponse;
import com.major.stockportfolio.entity.PaperTradingAccount;
import com.major.stockportfolio.entity.Portfolio;
import com.major.stockportfolio.entity.Stock;
import com.major.stockportfolio.entity.Transaction;
import com.major.stockportfolio.entity.User;
import com.major.stockportfolio.exception.BadRequestException;
import com.major.stockportfolio.exception.ResourceNotFoundException;
import com.major.stockportfolio.exception.UnauthorizedException;
import com.major.stockportfolio.repository.PaperTradingAccountRepository;
import com.major.stockportfolio.repository.PortfolioRepository;
import com.major.stockportfolio.repository.StockRepository;
import com.major.stockportfolio.repository.TransactionRepository;
import com.major.stockportfolio.repository.UserRepository;
import com.major.stockportfolio.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final PortfolioRepository portfolioRepository;
    private final StockRepository stockRepository;
    private final UserRepository userRepository;
    private final PaperTradingAccountRepository paperTradingAccountRepository;
    private final PaperTradingAccountService paperTradingAccountService;

    // Return All Transactions
    @Transactional(readOnly = true)
    public List<TransactionResponse> getAllTransactions() {
        User currentUser = getCurrentUser();

        return transactionRepository.findByPortfolioUserId(currentUser.getId())
                .stream()
                .map(tx ->
                        TransactionResponse.builder()
                                .id(tx.getId())
                                .symbol(tx.getStock().getSymbol())
                                .companyName(tx.getStock().getCompanyName())
                                .quantity(tx.getQuantity())
                                .price(tx.getPrice().doubleValue())
                                .transactionType(tx.getTransactionType())
                                .transactionDate(tx.getTransactionDate())
                                .build()
                )
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getTransactions(
            Long portfolioId,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("transactionDate").descending()
        );

        getUserOwnedPortfolio(portfolioId);

        return transactionRepository
                .findByPortfolioId(portfolioId, pageable)
                .map(tx ->
                        TransactionResponse.builder()
                                .id(tx.getId())
                                .symbol(tx.getStock().getSymbol())
                                .companyName(tx.getStock().getCompanyName())
                                .quantity(tx.getQuantity())
                                .price(tx.getPrice().doubleValue())
                                .transactionType(tx.getTransactionType())
                                .transactionDate(tx.getTransactionDate())
                                .build()
                );
    }

    // =====================================================
    // BUY STOCK
    // =====================================================
    @Transactional
    public TransactionResponse buyStock(BuyStockRequest request) {
        // 1. Authenticate user & validate portfolio ownership
        Portfolio portfolio = getUserOwnedPortfolio(request.getPortfolioId());
        User currentUser = getCurrentUser();

        // 2. Validate quantity
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }

        // 3. Validate price
        if (request.getPrice() == null || request.getPrice() <= 0) {
            throw new BadRequestException("Execution price must be greater than 0");
        }

        // 4. Validate stock
        if (request.getSymbol() == null || request.getSymbol().trim().isEmpty()) {
            throw new BadRequestException("Stock symbol is required");
        }

        Stock stock = stockRepository.findBySymbol(request.getSymbol().trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found: " + request.getSymbol()));

        // 5. Calculate monetary values
        BigDecimal executionPrice = BigDecimal.valueOf(request.getPrice()).setScale(2, RoundingMode.HALF_UP);
        BigDecimal orderValue = executionPrice.multiply(BigDecimal.valueOf(request.getQuantity())).setScale(2, RoundingMode.HALF_UP);

        // 6. Check & deduct available cash atomically with pessimistic lock
        PaperTradingAccount account = paperTradingAccountRepository.findByUserIdForUpdate(currentUser.getId())
                .orElseGet(() -> paperTradingAccountService.getOrCreateAccountForUser(currentUser));

        if (account.getAvailableCash().compareTo(orderValue) < 0) {
            throw new BadRequestException(
                    String.format("Insufficient funds. Available balance: ₹%,.2f. Required: ₹%,.2f.",
                            account.getAvailableCash(), orderValue)
            );
        }

        account.setAvailableCash(account.getAvailableCash().subtract(orderValue));
        paperTradingAccountRepository.save(account);

        // 7. Create & persist transaction
        Transaction transaction = Transaction.builder()
                .portfolio(portfolio)
                .stock(stock)
                .quantity(request.getQuantity())
                .price(executionPrice)
                .transactionType("BUY")
                .transactionDate(LocalDateTime.now())
                .build();

        Transaction saved = transactionRepository.save(transaction);
        log.info("BUY trade executed: {} shares of {} @ ₹{} (Order Value: ₹{}, Remaining Cash: ₹{}) for user {}",
                saved.getQuantity(), stock.getSymbol(), executionPrice, orderValue, account.getAvailableCash(), currentUser.getEmail());

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
        // 1. Authenticate user & validate portfolio ownership
        Portfolio portfolio = getUserOwnedPortfolio(request.getPortfolioId());
        User currentUser = getCurrentUser();

        // 2. Validate quantity
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }

        // 3. Validate price
        if (request.getPrice() == null || request.getPrice() <= 0) {
            throw new BadRequestException("Execution price must be greater than 0");
        }

        // 4. Validate stock
        if (request.getSymbol() == null || request.getSymbol().trim().isEmpty()) {
            throw new BadRequestException("Stock symbol is required");
        }

        Stock stock = stockRepository.findBySymbol(request.getSymbol().trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found: " + request.getSymbol()));

        // 5. Verify holdings
        int availableQty = getNetQuantity(portfolio.getId(), stock.getSymbol());

        if (availableQty < request.getQuantity()) {
            throw new BadRequestException(
                    String.format("Insufficient holdings. You own %d %s shares.", availableQty, stock.getSymbol())
            );
        }

        // 6. Calculate sell value
        BigDecimal executionPrice = BigDecimal.valueOf(request.getPrice()).setScale(2, RoundingMode.HALF_UP);
        BigDecimal sellValue = executionPrice.multiply(BigDecimal.valueOf(request.getQuantity())).setScale(2, RoundingMode.HALF_UP);

        // 7. Increase available cash atomically
        PaperTradingAccount account = paperTradingAccountRepository.findByUserIdForUpdate(currentUser.getId())
                .orElseGet(() -> paperTradingAccountService.getOrCreateAccountForUser(currentUser));

        account.setAvailableCash(account.getAvailableCash().add(sellValue));
        paperTradingAccountRepository.save(account);

        // 8. Create & persist transaction
        Transaction transaction = Transaction.builder()
                .portfolio(portfolio)
                .stock(stock)
                .quantity(request.getQuantity())
                .price(executionPrice)
                .transactionType("SELL")
                .transactionDate(LocalDateTime.now())
                .build();

        Transaction saved = transactionRepository.save(transaction);
        log.info("SELL trade executed: {} shares of {} @ ₹{} (Proceeds: ₹{}, New Cash: ₹{}) for user {}",
                saved.getQuantity(), stock.getSymbol(), executionPrice, sellValue, account.getAvailableCash(), currentUser.getEmail());

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

        getUserOwnedPortfolio(portfolioId);

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
            double currentPrice = stock.getCurrentPrice() != null
                    ? stock.getCurrentPrice().doubleValue()
                    : avgBuyPrice;
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

        getUserOwnedPortfolio(portfolioId);

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
                : 0.0;

        User currentUser = getCurrentUser();
        PaperTradingAccount account = paperTradingAccountRepository.findByUserId(currentUser.getId())
                .orElseGet(() -> paperTradingAccountService.getOrCreateAccountForUser(currentUser));

        double availableCash = account.getAvailableCash() != null ? account.getAvailableCash().doubleValue() : 0.0;
        double totalPortfolioValue = currentValue + availableCash;

        return PortfolioSummaryResponse.builder()
                .availableCash(availableCash)
                .totalPortfolioValue(totalPortfolioValue)
                .totalInvestment(totalInvestment)
                .currentValue(currentValue)
                .totalProfitLoss(totalProfitLoss)
                .returnPercentage(returnPercentage)
                .build();
    }

    // =====================================================
    // HELPER METHODS
    // =====================================================
    @Transactional(readOnly = true)
    public int getNetQuantity(Long portfolioId, String symbol) {

        return getHoldings(portfolioId).stream()
                .filter(h -> h.getSymbol().equalsIgnoreCase(symbol))
                .map(HoldingResponse::getQuantity)
                .findFirst()
                .orElse(0);
    }

    private User getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private Portfolio getUserOwnedPortfolio(Long portfolioId) {
        User currentUser = getCurrentUser();

        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found: " + portfolioId));

        if (!portfolio.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        return portfolio;
    }
}
