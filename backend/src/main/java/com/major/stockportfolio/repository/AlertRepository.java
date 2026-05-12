package com.major.stockportfolio.repository;

import com.major.stockportfolio.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertRepository extends JpaRepository<Alert, Long> {
}