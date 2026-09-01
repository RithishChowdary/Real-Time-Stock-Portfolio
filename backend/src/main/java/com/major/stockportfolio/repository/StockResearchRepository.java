package com.major.stockportfolio.repository;

import com.major.stockportfolio.entity.StockResearch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockResearchRepository extends JpaRepository<StockResearch, Long> {

    @Query("""
          SELECT sr
          FROM StockResearch sr
          JOIN FETCH sr.stock
          WHERE sr.stock.id = :stockId
          ORDER BY sr.createdAt DESC
          """)
    List<StockResearch> findByStockIdOrderByCreatedAtDesc(@Param("stockId") Long stockId);

    @Query("""
          SELECT sr
          FROM StockResearch sr
          JOIN FETCH sr.stock
          ORDER BY sr.createdAt DESC
          """)
    List<StockResearch> findAllOrderByCreatedAtDesc();
}