package com.moneyshift.api.service;

import com.moneyshift.api.model.DashboardData;
import com.moneyshift.api.model.DashboardData.MonthlyData;
import com.moneyshift.api.model.DashboardData.NotificationItem;
import com.moneyshift.api.model.DashboardData.TransactionSummary;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    public DashboardData getDashboardSummary() {
        
        // 월간 데이터 생성
        MonthlyData monthlyData = MonthlyData.builder()
                .revenue(new BigDecimal("125000000"))      // 1억 2500만원
                .expense(new BigDecimal("98000000"))       // 9800만원
                .profit(new BigDecimal("27000000"))        // 2700만원
                .estimatedTax(new BigDecimal("5940000"))   // 594만원
                .revenueChange(new BigDecimal("15.0"))     // +15%
                .expenseChange(new BigDecimal("5.0"))      // +5%
                .period(LocalDate.now().getYear() + "년 " + LocalDate.now().getMonthValue() + "월")
                .build();

        // 알림 데이터 생성
        List<NotificationItem> notifications = Arrays.asList(
                NotificationItem.builder()
                        .id("1")
                        .type("warning")
                        .title("검토 필요")
                        .message("신규 거래 3건 검토 필요")
                        .priority("high")
                        .isRead(false)
                        .build(),
                NotificationItem.builder()
                        .id("2")
                        .type("info")
                        .title("세금 신고")
                        .message("부가세 신고 마감 D-5")
                        .dueDate(LocalDate.now().plusDays(5))
                        .priority("medium")
                        .isRead(false)
                        .build(),
                NotificationItem.builder()
                        .id("3")
                        .type("warning")
                        .title("접대비 한도")
                        .message("이번 달 접대비 한도 80% 도달")
                        .priority("medium")
                        .isRead(false)
                        .build()
        );

        // 최근 거래 데이터 생성
        List<TransactionSummary> recentTransactions = Arrays.asList(
                TransactionSummary.builder()
                        .id(1L)
                        .merchant("스타벅스 강남점")
                        .amount(new BigDecimal("5400"))
                        .type("expense")
                        .category("복리후생비")
                        .transactionDate(LocalDate.now())
                        .status("pending")
                        .confidence(0.85)
                        .build(),
                TransactionSummary.builder()
                        .id(2L)
                        .merchant("ABC마케팅")
                        .amount(new BigDecimal("330000"))
                        .type("expense")
                        .category("광고선전비")
                        .transactionDate(LocalDate.now())
                        .status("pending")
                        .confidence(0.72)
                        .build(),
                TransactionSummary.builder()
                        .id(3L)
                        .merchant("클라이언트입금")
                        .amount(new BigDecimal("2200000"))
                        .type("income")
                        .category("매출")
                        .transactionDate(LocalDate.now())
                        .status("approved")
                        .confidence(1.0)
                        .build()
        );

        // 통계 데이터 생성
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalTransactions", 156);
        statistics.put("pendingTransactions", 3);
        statistics.put("approvedTransactions", 153);
        statistics.put("classificationAccuracy", 0.92);

        return DashboardData.builder()
                .monthlyData(monthlyData)
                .notifications(notifications)
                .recentTransactions(recentTransactions)
                .statistics(statistics)
                .build();
    }

    public Map<String, Object> getNotifications() {
        Map<String, Object> result = new HashMap<>();
        
        // 알림 목록
        List<NotificationItem> notifications = getDashboardSummary().getNotifications();
        
        result.put("notifications", notifications);
        result.put("unreadCount", notifications.stream()
                .mapToInt(n -> n.isRead() ? 0 : 1)
                .sum());
        
        return result;
    }

    public Map<String, Object> getRecentTransactions(int limit) {
        Map<String, Object> result = new HashMap<>();
        
        List<TransactionSummary> allTransactions = getDashboardSummary().getRecentTransactions();
        List<TransactionSummary> limitedTransactions = allTransactions.stream()
                .limit(limit)
                .collect(Collectors.toList());
        
        result.put("transactions", limitedTransactions);
        result.put("totalCount", allTransactions.size());
        result.put("hasMore", allTransactions.size() > limit);
        
        return result;
    }
}