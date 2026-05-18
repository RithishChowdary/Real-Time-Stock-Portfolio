package com.major.stockportfolio.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "stocks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({
        "hibernateLazyInitializer",
        "handler"
})
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String symbol;

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal currentPrice;

    private LocalDateTime lastUpdated;

        @PrePersist
        public void prePersist() {
        this.lastUpdated = LocalDateTime.now();
}
}