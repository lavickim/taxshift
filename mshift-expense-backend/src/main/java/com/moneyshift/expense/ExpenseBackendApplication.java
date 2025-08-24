package com.moneyshift.expense;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * 가계부 앱 백엔드 애플리케이션
 * 간편한 가계부 기능을 제공하는 스프링 부트 애플리케이션
 */
@SpringBootApplication
@EnableTransactionManagement
public class ExpenseBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExpenseBackendApplication.class, args);
        System.out.println("💰 가계부 백엔드 서버가 시작되었습니다!");
        System.out.println("📊 API 문서: http://localhost:8081/api/swagger-ui.html");
        System.out.println("🏥 Health Check: http://localhost:8081/api/actuator/health");
    }
}