# Docker PostgreSQL 설정 가이드

## 🐳 Docker Compose 설정

프로젝트 루트에 `docker-compose.yml` 파일을 생성합니다:

```yaml
version: '3.8'

services:
  trojan-postgres:
    image: postgres:15-alpine
    container_name: trojan-expense-db
    environment:
      POSTGRES_DB: trojan_expense_db
      POSTGRES_USER: trojan_user
      POSTGRES_PASSWORD: trojan_password
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8"
    ports:
      - "5432:5432"
    volumes:
      - trojan_postgres_data:/var/lib/postgresql/data
      - ./project-design/trojan-horse/prd/database-schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
    networks:
      - trojan-network
    command: postgres -c log_statement=all -c log_min_messages=info

  trojan-redis:
    image: redis:7-alpine
    container_name: trojan-expense-redis
    ports:
      - "6379:6379"
    volumes:
      - trojan_redis_data:/data
    networks:
      - trojan-network
    command: redis-server --appendonly yes

  trojan-pgadmin:
    image: dpage/pgadmin4
    container_name: trojan-expense-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@trojan.com
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "8080:80"
    depends_on:
      - trojan-postgres
    networks:
      - trojan-network

volumes:
  trojan_postgres_data:
  trojan_redis_data:

networks:
  trojan-network:
    driver: bridge
```

## 🚀 실행 명령어

```bash
# 컨테이너 시작
docker-compose up -d

# 로그 확인
docker-compose logs trojan-postgres

# 데이터베이스 접속 (psql)
docker exec -it trojan-expense-db psql -U trojan_user -d trojan_expense_db

# 컨테이너 중지
docker-compose down

# 볼륨까지 삭제 (데이터 완전 초기화)
docker-compose down -v
```

## 🔧 백엔드 설정 (application.yml)

`mshift-trojan-backend/src/main/resources/application.yml`:

```yaml
spring:
  application:
    name: mshift-trojan-backend
  
  datasource:
    url: jdbc:postgresql://localhost:5432/trojan_expense_db
    username: trojan_user
    password: trojan_password
    driver-class-name: org.postgresql.Driver
    
  redis:
    host: localhost
    port: 6379
    timeout: 2000ms
    jedis:
      pool:
        max-active: 8
        max-wait: -1ms
        max-idle: 8
        min-idle: 0
        
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.PostgreSQLDialect

mybatis:
  mapper-locations: classpath:mapper/**/*.xml
  type-aliases-package: com.moneyshift.trojan.model
  configuration:
    map-underscore-to-camel-case: true
    
server:
  port: 8080
  
jwt:
  secret: trojan-expense-app-super-secret-key-2025
  expiration: 86400 # 24시간

logging:
  level:
    com.moneyshift.trojan: DEBUG
    org.springframework.security: DEBUG
```

## 📱 프론트엔드 설정

`mshift-trojan-app/src/config/api.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: __DEV__ ? 'http://localhost:8080' : 'https://api.trojanexpense.com',
  API_VERSION: 'v1',
  TIMEOUT: 10000,
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    REFRESH: '/api/v1/auth/refresh',
  },
  TRANSACTIONS: {
    LIST: '/api/v1/transactions',
    CREATE: '/api/v1/transactions',
    UPDATE: '/api/v1/transactions',
    DELETE: '/api/v1/transactions',
    MONTHLY: '/api/v1/transactions/monthly',
  },
  ASSETS: {
    LIST: '/api/v1/assets',
    CREATE: '/api/v1/assets',
    UPDATE: '/api/v1/assets',
    DELETE: '/api/v1/assets',
  },
  CATEGORIES: {
    LIST: '/api/v1/categories',
    CREATE: '/api/v1/categories',
    UPDATE: '/api/v1/categories',
    DELETE: '/api/v1/categories',
  },
  STATISTICS: {
    MONTHLY: '/api/v1/statistics/monthly',
    CATEGORY: '/api/v1/statistics/category',
    ASSETS: '/api/v1/statistics/assets',
  },
};
```

## 🗄️ 데이터베이스 초기화 확인

컨테이너 실행 후 다음 쿼리로 확인:

```sql
-- 테이블 목록 확인
\dt

-- 기본 카테고리 확인
SELECT * FROM categories WHERE user_id IS NULL;

-- 뷰 확인  
SELECT * FROM monthly_statistics LIMIT 5;
SELECT * FROM asset_summary LIMIT 5;
```

이제 데이터베이스가 준비되었으니 백엔드 개발을 시작할 수 있습니다!