package com.major.stockportfolio.repository;

import com.major.stockportfolio.entity.Alert;
import com.major.stockportfolio.entity.Stock;
import com.major.stockportfolio.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByUser(User user);

    List<Alert> findByStockAndActiveTrue(Stock stock);

    List<Alert> findByActiveTrue();
}