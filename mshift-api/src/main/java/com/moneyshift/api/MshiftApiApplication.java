package com.moneyshift.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class MshiftApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(MshiftApiApplication.class, args);
    }
}