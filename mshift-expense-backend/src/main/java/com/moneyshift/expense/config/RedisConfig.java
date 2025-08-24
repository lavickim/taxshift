package com.moneyshift.expense.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import lombok.extern.slf4j.Slf4j;

/**
 * Redis 설정 클래스
 * 트로이 목마 가계부 앱의 캐싱 및 세션 저장을 위한 Redis 구성
 */
@Slf4j
@Configuration
public class RedisConfig {
    
    @Value("${spring.redis.host:localhost}")
    private String redisHost;
    
    @Value("${spring.redis.port:6380}")
    private int redisPort;
    
    @Bean
    public LettuceConnectionFactory lettuceConnectionFactory() {
        log.info("🔧 Redis 설정 초기화: {}:{}", redisHost, redisPort);
        
        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
        config.setHostName(redisHost);
        config.setPort(redisPort);
        
        LettuceConnectionFactory factory = new LettuceConnectionFactory(config);
        log.info("✅ Redis 연결 팩토리 생성 완료: {}:{}", redisHost, redisPort);
        
        return factory;
    }
    
    @Bean
    public RedisTemplate<String, Object> redisTemplate(LettuceConnectionFactory connectionFactory) {
        log.info("🔧 RedisTemplate 설정 초기화");
        
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        
        // String 직렬화 설정
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        template.setValueSerializer(stringSerializer);
        template.setHashValueSerializer(stringSerializer);
        
        template.afterPropertiesSet();
        
        log.info("✅ RedisTemplate 설정 완료");
        return template;
    }
}