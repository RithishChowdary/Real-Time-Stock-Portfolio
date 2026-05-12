package com.major.stockportfolio.repository;

import com.major.stockportfolio.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
}