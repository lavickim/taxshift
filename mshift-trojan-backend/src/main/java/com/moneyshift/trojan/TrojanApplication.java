package com.moneyshift.trojan;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@MapperScan("com.moneyshift.trojan.mapper")
@EnableCaching
@EnableAsync
public class TrojanApplication {

    public static void main(String[] args) {
        SpringApplication.run(TrojanApplication.class, args);
    }
}