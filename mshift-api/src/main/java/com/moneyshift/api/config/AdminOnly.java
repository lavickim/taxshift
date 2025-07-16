package com.moneyshift.api.config;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 어드민 전용 API를 표시하는 어노테이션
 * TODO: 향후 AOP를 통한 실제 인증 구현 필요
 */
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface AdminOnly {
    String value() default "Admin authentication required";
}