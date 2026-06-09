package com.major.stockportfolio.repository;

import com.major.stockportfolio.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TransactionRepository extends JpaRepository<Transaction, Long>
 {

    Page<Transaction> findByPortfolioId(
            Long portfolioId,
            Pageable pageable
    );
    List<Transaction> findByPortfolioId(Long portfolioId);
    
    List<Transaction> findByPortfolioUserId(Long userId);

    List<Transaction> findTop10ByPortfolioUserIdOrderByTransactionDateDesc(Long userId);
}