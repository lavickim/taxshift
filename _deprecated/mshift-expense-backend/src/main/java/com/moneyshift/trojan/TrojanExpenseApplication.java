package com.moneyshift.trojan;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * 트로이 목마 가계부 앱 백엔드 메인 애플리케이션
 * Java 21 + Spring Boot 3.2.7 기반
 */
@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableTransactionManagement
public class TrojanExpenseApplication {

    public static void main(String[] args) {
        System.setProperty("spring.profiles.active", "dev");
        SpringApplication.run(TrojanExpenseApplication.class, args);
    }
}