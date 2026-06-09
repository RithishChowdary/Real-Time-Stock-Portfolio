package com.major.stockportfolio.repository;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.major.stockportfolio.entity.StockResearch;
@Repository
public interface StockResearchRepository
        extends JpaRepository<StockResearch, Long> {

 @Query("""
       SELECT sr
       FROM StockResearch sr
       JOIN FETCH sr.stock
       WHERE sr.stock.id = :stockId
       ORDER BY sr.createdAt DESC
       """)
List<StockResearch>
findByStockIdOrderByCreatedAtDesc(
        @Param("stockId")
        Long stockId);
}