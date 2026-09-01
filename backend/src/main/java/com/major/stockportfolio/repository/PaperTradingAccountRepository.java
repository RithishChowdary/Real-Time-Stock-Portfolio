package com.major.stockportfolio.repository;

import com.major.stockportfolio.entity.PaperTradingAccount;
import com.major.stockportfolio.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaperTradingAccountRepository extends JpaRepository<PaperTradingAccount, Long> {

    Optional<PaperTradingAccount> findByUser(User user);

    Optional<PaperTradingAccount> findByUserId(Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM PaperTradingAccount a WHERE a.user.id = :userId")
    Optional<PaperTradingAccount> findByUserIdForUpdate(@Param("userId") Long userId);
}
