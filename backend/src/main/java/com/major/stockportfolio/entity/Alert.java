package com.major.stockportfolio.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;

    private BigDecimal targetPrice;
    private BigDecimal stopLoss;
    private Double profitPercentage;
    private Double lossPercentage;

    private Boolean active;

    @PrePersist
    public void prePersist() {
        if (active == null) {
            active = true;
        }
    }
}