// DashboardController.java
package com.major.stockportfolio.controller;

import com.major.stockportfolio.dto.DashboardSummaryDto;
import com.major.stockportfolio.dto.HoldingResponse;
import com.major.stockportfolio.dto.NotificationResponse;
import com.major.stockportfolio.dto.PortfolioPerformanceResponse;
import com.major.stockportfolio.dto.RecentTransactionResponse;
import com.major.stockportfolio.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDto> getDashboardSummary() {

        return ResponseEntity.ok(
                dashboardService.getDashboardSummary()
        );
    }

    // Holdings API
    @GetMapping("/holdings")
    public ResponseEntity<List<HoldingResponse>> getHoldings() {

        return ResponseEntity.ok(
                dashboardService.getHoldings()
        );
    }

    @GetMapping("/recent-transactions")
public ResponseEntity<List<RecentTransactionResponse>> getRecentTransactions() {

    return ResponseEntity.ok(
            dashboardService.getRecentTransactions()
    );
}

        @GetMapping("/notifications")
public ResponseEntity<List<NotificationResponse>> getNotifications() {

    return ResponseEntity.ok(
            dashboardService.getNotifications()
    );
}

        @GetMapping("/performance/{portfolioId}")
public ResponseEntity<
        List<PortfolioPerformanceResponse>
        > getPortfolioPerformance(
                @PathVariable Long portfolioId) {

    return ResponseEntity.ok(
            dashboardService
                    .getPortfolioPerformance(
                            portfolioId
                    )
    );
}

}
