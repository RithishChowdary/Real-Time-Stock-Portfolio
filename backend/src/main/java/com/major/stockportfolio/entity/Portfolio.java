package com.major.stockportfolio.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "portfolios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String portfolioName;

    // Total amount invested in this portfolio
    private BigDecimal totalInvestment;

    // Current market value of this portfolio
    private BigDecimal currentValue;

    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Builder.Default
    @OneToMany(mappedBy = "portfolio", cascade = CascadeType.ALL)
    private List<Transaction> transactions = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();

        // Default values to avoid null pointer issues
        if (totalInvestment == null) {
            totalInvestment = BigDecimal.ZERO;
        }

        if (currentValue == null) {
            currentValue = BigDecimal.ZERO;
        }
    }
}