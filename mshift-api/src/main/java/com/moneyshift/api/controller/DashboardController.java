package com.moneyshift.api.controller;

import com.moneyshift.api.model.DashboardData;
import com.moneyshift.api.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardData> getDashboardSummary() {
        try {
            DashboardData summary = dashboardService.getDashboardSummary();
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/notifications")
    public ResponseEntity<Map<String, Object>> getNotifications() {
        try {
            Map<String, Object> notifications = dashboardService.getNotifications();
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/recent-transactions")
    public ResponseEntity<Map<String, Object>> getRecentTransactions(@RequestParam(defaultValue = "5") int limit) {
        try {
            Map<String, Object> recentTransactions = dashboardService.getRecentTransactions(limit);
            return ResponseEntity.ok(recentTransactions);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}