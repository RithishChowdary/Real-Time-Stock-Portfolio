package com.major.stockportfolio.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
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

    // Ignore user in JSON response
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    // Ignore stock in JSON response
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", nullable = false)
    @JsonIgnore
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