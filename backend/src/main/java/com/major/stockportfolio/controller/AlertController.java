package com.major.stockportfolio.controller;

import com.major.stockportfolio.dto.CreateAlertRequest;
import com.major.stockportfolio.entity.Alert;
import com.major.stockportfolio.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @PostMapping
    public Alert createAlert(@RequestBody CreateAlertRequest request) {
        return alertService.createAlert(request);
    }

    @GetMapping("/user/{userId}")
    public List<Alert> getUserAlerts(@PathVariable Long userId) {
        return alertService.getUserAlerts(userId);
    }
}