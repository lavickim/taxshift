package com.moneyshift.expense;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.moneyshift.expense.repository")
public class ExpenseBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(ExpenseBackendApplication.class, args);
    }
}