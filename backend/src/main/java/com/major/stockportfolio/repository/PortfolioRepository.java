package com.major.stockportfolio.repository;

import com.major.stockportfolio.entity.Portfolio;
import com.major.stockportfolio.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {

    List<Portfolio> findByUser(User user);

    List<Portfolio> findByUserId(Long userId);
    
    Optional<Portfolio> findByIdAndUser(Long id, User user);
}