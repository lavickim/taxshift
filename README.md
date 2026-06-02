# MoneyShift 

AI 기반 거래 내역 분석 및 정규화 시스템

## 📋 목차

- [프로젝트 개요](#프로젝트-개요)
- [아키텍처](#아키텍처)
- [설치 및 실행](#설치-및-실행)
- [테스트](#테스트)
- [API 문서](#api-문서)
- [개발 가이드](#개발-가이드)

## 🎯 프로젝트 개요

MoneyShift는 은행 거래 내역을 AI와 정규식 규칙을 사용해 자동으로 분석하고 정규화하는 시스템입니다.

### 주요 기능

- **규칙 기반 텍스트 정규화**: 정규식 패턴을 사용한 거래 내역 분류
- **실시간 규칙 관리**: 웹 UI를 통한 CRUD 작업
- **고성능 캐싱**: Redis를 활용한 규칙 캐싱
- **마이크로서비스 아키텍처**: NextJS + Spring Boot 분리

### 기술 스택

**백엔드 (Java)**
- Spring Boot 3.2.7
- Java 17 LTS
- MyBatis 3.0.3
- PostgreSQL 15
- Redis 7.2
- Maven

**프론트엔드 (NextJS)**
- Next.js 15.3.3
- TypeScript
- Tailwind CSS
- React 18
- Shadcn/ui

**테스팅**
- Puppeteer E2E 테스트
- JUnit (백엔드)
- Jest (프론트엔드)

## 🏗️ 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   NextJS Admin  │───▶│   Spring Boot   │───▶│   PostgreSQL    │
│   (Port 3000)   │    │   (Port 8080)   │    │   (Port 5432)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │      Redis      │
                       │   (Port 6379)   │
                       └─────────────────┘
```

### 컴포넌트 구조

```
moneyshift_be/
├── mshift-api/          # Spring Boot API 서버
│   ├── src/main/java/
│   │   └── com/moneyshift/api/
│   │       ├── controller/    # REST API 컨트롤러
│   │       ├── service/       # 비즈니스 로직
│   │       ├── model/         # 데이터 모델
│   │       ├── mapper/        # MyBatis 매퍼
│   │       └── config/        # 설정 클래스
│   └── src/main/resources/
│       ├── mapper/            # MyBatis XML 매퍼
│       └── application.yml    # 애플리케이션 설정
├── mshift-admin/        # NextJS 관리자 패널
│   ├── app/             # Next.js 13+ App Router
│   ├── components/      # React 컴포넌트
│   ├── lib/            # 유틸리티 및 서비스
│   └── public/         # 정적 파일
├── tests/              # 테스트 스크립트
│   └── e2e/           # Puppeteer E2E 테스트
├── scripts/           # 빌드 및 테스트 스크립트
└── docker-compose.yml # 개발 환경 컨테이너
```

## 🚀 설치 및 실행

### 사전 요구사항

- Java 17 이상
- Node.js 18 이상
- Docker 및 Docker Compose
- Maven 3.8 이상

### 🎯 빠른 시작 (권장)

```bash
git clone <repository-url>
cd moneyshift_be

# 전체 시스템 한 번에 시작
./start-all.sh

# 또는 개별 실행
./start-db.sh      # 데이터베이스만
./start-backend.sh # Java API 서버만  
./start-frontend.sh # NextJS 프론트엔드만

# 테스트 실행
./test.sh

# 전체 시스템 중지
./stop-all.sh
```

### 📋 개별 실행 방법

#### 1. 데이터베이스 서비스 시작

```bash
./start-db.sh
# 또는: docker-compose up -d postgres redis
```

#### 2. 백엔드 API 서버 실행

```bash
./start-backend.sh
# 또는: cd mshift-api && mvn spring-boot:run
```

서버가 `http://localhost:8080`에서 실행됩니다.

#### 3. 프론트엔드 관리자 패널 실행

```bash
./start-frontend.sh  
# 또는: cd mshift-admin && yarn dev
```

관리자 패널이 `http://localhost:3000`에서 실행됩니다.

### 5. 초기 데이터 로드 (선택사항)

```bash
# 샘플 정규식 규칙 로드
psql -h localhost -U postgres -d moneyshift -f scripts/migrate-csv-to-db.sql
```

## 🧪 테스트

### 전체 통합 테스트 실행

```bash
# 모든 서비스가 실행 중인 상태에서
./scripts/test-integrated.sh
```

### 개별 테스트 실행

```bash
# 기본 API 테스트
./scripts/test-rule-management.sh

# Puppeteer E2E 테스트 (규칙 관리)
npm install puppeteer
node tests/e2e/puppeteer-rule-management.test.js

# Puppeteer API 테스트
node tests/e2e/puppeteer-api-test.js
```

### 테스트 결과

테스트 결과는 `test-results/` 디렉토리에 저장됩니다:
- `integrated-test-report.log`: 통합 테스트 상세 로그
- `test_summary.csv`: 테스트 결과 요약
- `rule-management-test.log`: 규칙 관리 테스트 로그

## 📚 API 문서

### 주요 엔드포인트

#### 규칙 엔진 API

```bash
# 모든 활성 규칙 조회
GET /api/rule-engine/rules

# 카테고리별 규칙 조회
GET /api/rule-engine/rules/category/{category}

# 텍스트 매칭
POST /api/rule-engine/match
{
  "inputText": "GS25에서 결제",
  "category": "편의점",
  "returnAllMatches": true
}

# 캐시 새로고침
POST /api/rule-engine/refresh-cache
```

#### 관리자 API

```bash
# 새 규칙 생성
POST /api/admin/rules
{
  "pattern": "(GS25|편의점)",
  "description": "편의점 결제",
  "category": "편의점",
  "enabled": true,
  "priority": 50,
  "confidence": 0.8
}

# 규칙 수정
PUT /api/admin/rules/{id}

# 규칙 삭제
DELETE /api/admin/rules/{id}

# 규칙 활성화/비활성화
PATCH /api/admin/rules/{id}/enable
PATCH /api/admin/rules/{id}/disable
```

#### NextJS 프록시 API

```bash
# 규칙 조회 (프록시)
GET /api/regex-rules

# 텍스트 매칭 (프록시)
POST /api/regex/match
{
  "text": "GS25에서 결제",
  "category": "편의점"
}
```

## 🛠️ 개발 가이드

### 새 정규식 규칙 추가

1. **관리자 패널 사용**:
   - `http://localhost:3000`에서 규칙 관리 탭 이용
   - 실시간 테스트 기능으로 검증

2. **API 직접 호출**:
   ```bash
   curl -X POST http://localhost:8080/api/admin/rules \
     -H "Content-Type: application/json" \
     -d '{
       "pattern": "새로운패턴",
       "description": "설명",
       "category": "카테고리",
       "enabled": true,
       "priority": 50
     }'
   ```

### 새 카테고리 추가

1. 프론트엔드 `CATEGORIES` 배열에 추가:
   ```typescript
   // mshift-admin/components/regex-rules-management.tsx
   const CATEGORIES = [
     '주유소', '편의점', '카센터', '온라인서비스',
     '새로운카테고리' // 추가
   ];
   ```

2. 백엔드 매퍼에서 카테고리 확인 (선택사항)

### 성능 최적화

- **Redis 캐싱**: 규칙이 시작시 Redis에 로드되어 빠른 조회 가능
- **우선순위 기반 매칭**: 높은 우선순위 규칙부터 매칭 수행
- **배치 처리**: 대량 텍스트 처리시 배치 API 사용 권장

### 로깅

- **백엔드**: `application.yml`에서 로깅 레벨 설정
- **프론트엔드**: 브라우저 개발자 도구에서 네트워크 탭 확인
- **테스트**: `test-results/` 디렉토리의 로그 파일 확인

### 데이터베이스 스키마

```sql
-- 정규식 규칙 테이블
CREATE TABLE regex_rules (
    id SERIAL PRIMARY KEY,
    pattern VARCHAR(500) NOT NULL,
    replacement VARCHAR(200),
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 50,
    confidence DECIMAL(3,2) DEFAULT 0.8,
    normalizer_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX idx_regex_rules_category ON regex_rules(category);
CREATE INDEX idx_regex_rules_enabled ON regex_rules(enabled);
CREATE INDEX idx_regex_rules_priority ON regex_rules(priority DESC);
```

## 🐛 문제 해결

### 일반적인 문제

1. **서버 연결 실패**:
   ```bash
   # 포트 사용 확인
   lsof -i :3000  # NextJS
   lsof -i :8080  # Spring Boot
   lsof -i :5432  # PostgreSQL
   lsof -i :6379  # Redis
   ```

2. **데이터베이스 연결 오류**:
   ```bash
   # PostgreSQL 컨테이너 상태 확인
   docker-compose logs postgres
   
   # 데이터베이스 연결 테스트
   psql -h localhost -U postgres -d moneyshift
   ```

3. **Redis 연결 오류**:
   ```bash
   # Redis 컨테이너 상태 확인
   docker-compose logs redis
   
   # Redis 연결 테스트
   redis-cli -h localhost ping
   ```

4. **테스트 실패**:
   ```bash
   # 상세 로그 확인
   cat test-results/integrated-test-report.log
   
   # 개별 테스트 실행
   ./scripts/test-rule-management.sh -v
   ```

### 개발 팁

- **핫 리로드**: NextJS는 자동 새로고침, Spring Boot는 `spring-boot-devtools` 사용
- **API 테스트**: Postman 컬렉션 또는 curl 스크립트 활용
- **성능 모니터링**: Spring Boot Actuator 엔드포인트 (`/actuator/health`, `/actuator/metrics`)

## 📝 라이센스

이 프로젝트는 [MIT 라이센스](LICENSE)를 따릅니다.

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원

문제가 있거나 질문이 있으시면 이슈를 생성하세요.
