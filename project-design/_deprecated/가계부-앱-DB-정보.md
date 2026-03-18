# 가계부 앱 데이터베이스 상세 정보
> MoneyShift Expense Tracker Database Schema
> 최종 업데이트: 2025-08-30

## 1. 데이터베이스 기본 정보

### 1.1 연결 정보
- **데이터베이스명**: `trojan_expense_db`
- **호스트**: `localhost`
- **포트**: `5433`
- **사용자명**: `trojan_user`
- **비밀번호**: `trojan_password`
- **인코딩**: `UTF-8`
- **PostgreSQL 버전**: 15 (Alpine)

### 1.2 명명 규칙
- 테이블명: `et_` 프리픽스 사용 (Expense Tracker)
- 소문자 스네이크 케이스 사용
- Primary Key: `{테이블명}_id` 형식
- Foreign Key: 참조 테이블의 PK명 그대로 사용
- 시간 필드: `created_at`, `updated_at` 형식

## 2. 테이블 스키마 상세

### 2.1 et_users (사용자 테이블)

#### 테이블 설명
사용자 계정 정보를 저장하는 핵심 테이블

#### 스키마
```sql
CREATE TABLE et_users (
    user_id BIGINT PRIMARY KEY DEFAULT nextval('et_users_user_id_seq'),
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,  -- BCrypt 해시
    nickname VARCHAR(50),
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

-- 인덱스
CREATE UNIQUE INDEX et_users_email_key ON et_users(email);
```

#### 컬럼 설명
| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| user_id | BIGINT | PK, AUTO_INCREMENT | 사용자 고유 ID |
| email | VARCHAR(100) | NOT NULL, UNIQUE | 로그인용 이메일 |
| password_hash | VARCHAR(255) | NOT NULL | BCrypt 암호화된 비밀번호 |
| nickname | VARCHAR(50) | NULL | 사용자 닉네임 |
| is_premium | BOOLEAN | DEFAULT false | 프리미엄 회원 여부 |
| created_at | TIMESTAMP | DEFAULT NOW | 가입일시 |
| last_login_at | TIMESTAMP | NULL | 마지막 로그인 시간 |

#### ⚠️ 주의사항
- `password` 아님, `password_hash` 사용
- `username` 아님, `nickname` 사용
- `is_active` 아님, `is_premium` 사용

### 2.2 et_categories (카테고리 테이블)

#### 테이블 설명
수입/지출 카테고리 정의

#### 스키마
```sql
CREATE TABLE et_categories (
    category_id BIGINT PRIMARY KEY DEFAULT nextval('et_categories_category_id_seq'),
    user_id BIGINT REFERENCES et_users(user_id) ON DELETE CASCADE,
    category_name VARCHAR(50) NOT NULL,
    category_type VARCHAR(10) NOT NULL CHECK (category_type IN ('INCOME', 'EXPENSE', 'TRANSFER')),
    icon_name VARCHAR(50),
    color_code VARCHAR(7),  -- HEX 색상 코드 (#RRGGBB)
    is_default BOOLEAN DEFAULT false,
    display_order INTEGER,
    parent_category_id BIGINT REFERENCES et_categories(category_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX idx_categories_user ON et_categories(user_id);
CREATE INDEX idx_categories_type ON et_categories(category_type);
```

#### 컬럼 설명
| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| category_id | BIGINT | PK | 카테고리 ID |
| user_id | BIGINT | FK(et_users) | 사용자 ID |
| category_name | VARCHAR(50) | NOT NULL | 카테고리명 |
| category_type | VARCHAR(10) | CHECK | INCOME/EXPENSE/TRANSFER |
| icon_name | VARCHAR(50) | NULL | Material Icon 이름 |
| color_code | VARCHAR(7) | NULL | HEX 색상 (#RRGGBB) |
| is_default | BOOLEAN | DEFAULT false | 기본 카테고리 여부 |
| display_order | INTEGER | NULL | 표시 순서 |
| parent_category_id | BIGINT | FK(self) | 상위 카테고리 |

#### 기본 카테고리
```sql
-- 수입 카테고리
INSERT INTO et_categories VALUES 
(1, 1, '급여', 'INCOME', 'account_balance_wallet', '#4CAF50', true, 1),
(2, 1, '부수입', 'INCOME', 'trending_up', '#8BC34A', false, 2);

-- 지출 카테고리
INSERT INTO et_categories VALUES
(3, 1, '식비', 'EXPENSE', 'restaurant', '#FF5722', true, 3),
(4, 1, '교통', 'EXPENSE', 'directions_car', '#2196F3', true, 4),
(5, 1, '문화', 'EXPENSE', 'movie', '#9C27B0', false, 5),
(6, 1, '쇼핑', 'EXPENSE', 'shopping_bag', '#E91E63', false, 6),
(7, 1, '의료', 'EXPENSE', 'local_hospital', '#00BCD4', false, 7),
(8, 1, '교육', 'EXPENSE', 'school', '#FF9800', false, 8),
(9, 1, '통신', 'EXPENSE', 'phone_android', '#795548', true, 9),
(10, 1, '주거', 'EXPENSE', 'home', '#607D8B', true, 10),
(11, 1, '금융', 'EXPENSE', 'account_balance', '#3F51B5', false, 11),
(12, 1, '기타', 'EXPENSE', 'category', '#9E9E9E', false, 12);
```

### 2.3 et_assets (자산/계좌 테이블)

#### 테이블 설명
사용자의 자산/계좌 정보 관리

#### 스키마
```sql
CREATE TABLE et_assets (
    asset_id BIGINT PRIMARY KEY DEFAULT nextval('et_assets_asset_id_seq'),
    user_id BIGINT NOT NULL REFERENCES et_users(user_id) ON DELETE CASCADE,
    asset_name VARCHAR(100) NOT NULL,
    asset_type VARCHAR(20) NOT NULL CHECK (asset_type IN ('CASH', 'BANK', 'CARD', 'INVESTMENT')),
    current_balance DECIMAL(15,2) DEFAULT 0,
    initial_balance DECIMAL(15,2) DEFAULT 0,
    bank_name VARCHAR(50),
    account_number VARCHAR(50),
    icon_name VARCHAR(50),
    color_code VARCHAR(7),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX idx_assets_user ON et_assets(user_id);
CREATE INDEX idx_assets_type ON et_assets(asset_type);
```

#### 컬럼 설명
| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| asset_id | BIGINT | PK | 자산 ID |
| user_id | BIGINT | FK, NOT NULL | 사용자 ID |
| asset_name | VARCHAR(100) | NOT NULL | 자산/계좌명 |
| asset_type | VARCHAR(20) | CHECK | CASH/BANK/CARD/INVESTMENT |
| current_balance | DECIMAL(15,2) | DEFAULT 0 | 현재 잔액 |
| initial_balance | DECIMAL(15,2) | DEFAULT 0 | 초기 잔액 |
| bank_name | VARCHAR(50) | NULL | 은행/카드사명 |
| account_number | VARCHAR(50) | NULL | 계좌/카드번호 |
| is_active | BOOLEAN | DEFAULT true | 활성 상태 |

#### 자산 타입 설명
- **CASH**: 현금
- **BANK**: 은행 계좌
- **CARD**: 신용/체크카드
- **INVESTMENT**: 투자 계좌

### 2.4 et_transactions (거래 테이블)

#### 테이블 설명
모든 금융 거래 내역 저장

#### 스키마
```sql
CREATE TABLE et_transactions (
    transaction_id BIGINT PRIMARY KEY DEFAULT nextval('et_transactions_transaction_id_seq'),
    user_id BIGINT REFERENCES et_users(user_id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES et_categories(category_id),
    asset_id BIGINT REFERENCES et_assets(asset_id),
    target_asset_id BIGINT REFERENCES et_assets(asset_id),  -- 이체 시 대상 계좌
    transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('INCOME', 'EXPENSE', 'TRANSFER')),
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    description VARCHAR(255),
    transaction_date DATE NOT NULL,
    transaction_time TIME,
    memo TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurring_config JSONB,  -- 반복 설정 JSON
    attachment_urls TEXT[],  -- 첨부 이미지 URL 배열
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX idx_transactions_user ON et_transactions(user_id);
CREATE INDEX idx_transactions_date ON et_transactions(transaction_date DESC);
CREATE INDEX idx_transactions_category ON et_transactions(category_id);
CREATE INDEX idx_transactions_asset ON et_transactions(asset_id);
CREATE INDEX idx_transactions_type ON et_transactions(transaction_type);
```

#### 컬럼 설명
| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| transaction_id | BIGINT | PK | 거래 ID |
| user_id | BIGINT | FK | 사용자 ID |
| category_id | BIGINT | FK | 카테고리 ID |
| asset_id | BIGINT | FK | 자산/계좌 ID |
| target_asset_id | BIGINT | FK | 이체 대상 계좌 |
| transaction_type | VARCHAR(10) | CHECK | INCOME/EXPENSE/TRANSFER |
| amount | DECIMAL(15,2) | NOT NULL, > 0 | 금액 |
| description | VARCHAR(255) | NULL | 거래 설명 |
| transaction_date | DATE | NOT NULL | 거래일 |
| transaction_time | TIME | NULL | 거래 시간 |
| memo | TEXT | NULL | 메모 |
| is_recurring | BOOLEAN | DEFAULT false | 반복 거래 여부 |
| recurring_config | JSONB | NULL | 반복 설정 |
| attachment_urls | TEXT[] | NULL | 첨부 파일 URL |

#### 반복 설정 JSON 구조
```json
{
  "recurringType": "MONTHLY",  // DAILY, WEEKLY, MONTHLY, YEARLY
  "interval": 1,  // 반복 간격
  "endDate": "2025-12-31",  // 종료일 (선택)
  "weekdays": [1, 5],  // 요일 (WEEKLY인 경우)
  "dayOfMonth": 15  // 매월 특정일 (MONTHLY인 경우)
}
```

### 2.5 et_budgets (예산 테이블)

#### 테이블 설명
월별 카테고리별 예산 관리

#### 스키마
```sql
CREATE TABLE et_budgets (
    budget_id BIGINT PRIMARY KEY DEFAULT nextval('et_budgets_budget_id_seq'),
    user_id BIGINT REFERENCES et_users(user_id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES et_categories(category_id),
    budget_amount DECIMAL(15,2) NOT NULL CHECK (budget_amount > 0),
    spent_amount DECIMAL(15,2) DEFAULT 0,
    budget_year INTEGER NOT NULL,
    budget_month INTEGER NOT NULL CHECK (budget_month BETWEEN 1 AND 12),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, category_id, budget_year, budget_month)
);

-- 인덱스
CREATE INDEX idx_budgets_user ON et_budgets(user_id);
CREATE INDEX idx_budgets_period ON et_budgets(budget_year, budget_month);
```

#### 컬럼 설명
| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| budget_id | BIGINT | PK | 예산 ID |
| user_id | BIGINT | FK | 사용자 ID |
| category_id | BIGINT | FK | 카테고리 ID |
| budget_amount | DECIMAL(15,2) | NOT NULL, > 0 | 예산 금액 |
| spent_amount | DECIMAL(15,2) | DEFAULT 0 | 사용 금액 |
| budget_year | INTEGER | NOT NULL | 예산 연도 |
| budget_month | INTEGER | 1-12 | 예산 월 |

## 3. 데이터베이스 관계도 (ERD)

```
┌──────────────┐
│   et_users   │
│──────────────│
│ PK: user_id  │
└──────────────┘
        │
        │ 1:N
        ├────────────────┬────────────────┬────────────────┐
        ▼                ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│et_categories │ │  et_assets   │ │et_transactions│ │  et_budgets  │
│──────────────│ │──────────────│ │──────────────│ │──────────────│
│PK:category_id│ │PK: asset_id  │ │PK:transaction_id│ │PK: budget_id │
│FK: user_id   │ │FK: user_id   │ │FK: user_id   │ │FK: user_id   │
└──────────────┘ └──────────────┘ │FK: category_id│ │FK:category_id│
        ▲                ▲        │FK: asset_id   │ └──────────────┘
        │                │        │FK:target_asset_id│
        └────────────────┴────────┘
```

## 4. 트리거 및 함수

### 4.1 자동 잔액 업데이트 트리거
```sql
CREATE OR REPLACE FUNCTION update_asset_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 수입인 경우 잔액 증가
        IF NEW.transaction_type = 'INCOME' THEN
            UPDATE et_assets 
            SET current_balance = current_balance + NEW.amount
            WHERE asset_id = NEW.asset_id;
        -- 지출인 경우 잔액 감소
        ELSIF NEW.transaction_type = 'EXPENSE' THEN
            UPDATE et_assets 
            SET current_balance = current_balance - NEW.amount
            WHERE asset_id = NEW.asset_id;
        -- 이체인 경우
        ELSIF NEW.transaction_type = 'TRANSFER' THEN
            UPDATE et_assets 
            SET current_balance = current_balance - NEW.amount
            WHERE asset_id = NEW.asset_id;
            UPDATE et_assets 
            SET current_balance = current_balance + NEW.amount
            WHERE asset_id = NEW.target_asset_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_balance
AFTER INSERT ON et_transactions
FOR EACH ROW
EXECUTE FUNCTION update_asset_balance();
```

### 4.2 예산 사용액 업데이트 트리거
```sql
CREATE OR REPLACE FUNCTION update_budget_spent()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_type = 'EXPENSE' THEN
        UPDATE et_budgets
        SET spent_amount = spent_amount + NEW.amount
        WHERE user_id = NEW.user_id
          AND category_id = NEW.category_id
          AND budget_year = EXTRACT(YEAR FROM NEW.transaction_date)
          AND budget_month = EXTRACT(MONTH FROM NEW.transaction_date);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_budget
AFTER INSERT ON et_transactions
FOR EACH ROW
EXECUTE FUNCTION update_budget_spent();
```

## 5. 뷰 (Views)

### 5.1 월별 요약 뷰
```sql
CREATE OR REPLACE VIEW v_monthly_summary AS
SELECT 
    user_id,
    EXTRACT(YEAR FROM transaction_date) as year,
    EXTRACT(MONTH FROM transaction_date) as month,
    SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE 0 END) as total_income,
    SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END) as total_expense,
    SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE -amount END) as net_amount,
    COUNT(*) as transaction_count
FROM et_transactions
WHERE transaction_type IN ('INCOME', 'EXPENSE')
GROUP BY user_id, year, month;
```

### 5.2 카테고리별 통계 뷰
```sql
CREATE OR REPLACE VIEW v_category_statistics AS
SELECT 
    t.user_id,
    c.category_id,
    c.category_name,
    c.category_type,
    EXTRACT(YEAR FROM t.transaction_date) as year,
    EXTRACT(MONTH FROM t.transaction_date) as month,
    COUNT(*) as transaction_count,
    SUM(t.amount) as total_amount,
    AVG(t.amount) as avg_amount
FROM et_transactions t
JOIN et_categories c ON t.category_id = c.category_id
GROUP BY t.user_id, c.category_id, c.category_name, c.category_type, year, month;
```

## 6. 성능 최적화

### 6.1 인덱스 전략
- 자주 조회되는 컬럼에 인덱스 생성
- 복합 인덱스 활용 (user_id + transaction_date)
- 부분 인덱스 활용 (WHERE 조건)

### 6.2 파티셔닝
```sql
-- 거래 테이블을 연도별로 파티셔닝 (대용량 데이터 대비)
CREATE TABLE et_transactions_2025 PARTITION OF et_transactions
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

### 6.3 쿼리 최적화
- N+1 문제 방지 (JOIN FETCH 사용)
- 배치 INSERT 활용
- 캐시 적극 활용 (Redis)

## 7. 백업 및 복구

### 7.1 백업 스크립트
```bash
#!/bin/bash
# 일일 백업
BACKUP_DIR="/backup/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="trojan_expense_db"

# 전체 백업
PGPASSWORD=trojan_password pg_dump \
    -h localhost -p 5433 -U trojan_user \
    -d $DB_NAME \
    -f "$BACKUP_DIR/full_backup_$DATE.sql"

# 데이터만 백업
PGPASSWORD=trojan_password pg_dump \
    -h localhost -p 5433 -U trojan_user \
    -d $DB_NAME \
    --data-only \
    -f "$BACKUP_DIR/data_backup_$DATE.sql"

# 압축
gzip "$BACKUP_DIR/full_backup_$DATE.sql"
```

### 7.2 복구 절차
```bash
# 데이터베이스 복구
PGPASSWORD=trojan_password psql \
    -h localhost -p 5433 -U trojan_user \
    -d trojan_expense_db \
    < backup_file.sql
```

## 8. 보안 고려사항

### 8.1 접근 제어
- 각 사용자는 자신의 데이터만 접근 가능
- Row Level Security (RLS) 적용 고려

### 8.2 민감 정보 보호
- 비밀번호는 BCrypt 해시 (최소 10 라운드)
- 계좌번호 마스킹 처리
- SSL/TLS 연결 사용

### 8.3 감사 로그
```sql
CREATE TABLE et_audit_logs (
    log_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    table_name VARCHAR(50),
    action VARCHAR(10),
    record_id BIGINT,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 9. 마이그레이션

### 9.1 Flyway 마이그레이션 스크립트
```sql
-- V1__Initial_schema.sql
-- V2__Add_recurring_fields.sql
-- V3__Add_attachment_support.sql
```

### 9.2 버전 관리
- 모든 스키마 변경은 마이그레이션 스크립트로 관리
- 롤백 스크립트 준비
- 스테이징 환경에서 테스트 후 프로덕션 적용

## 10. 모니터링 쿼리

### 10.1 일일 통계
```sql
-- 오늘의 거래 현황
SELECT 
    COUNT(*) as total_transactions,
    SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE 0 END) as today_income,
    SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END) as today_expense
FROM et_transactions
WHERE transaction_date = CURRENT_DATE;
```

### 10.2 사용자 활동
```sql
-- 활성 사용자 수
SELECT COUNT(DISTINCT user_id) as active_users
FROM et_transactions
WHERE created_at > CURRENT_DATE - INTERVAL '30 days';
```

---

## 문서 정보
- **작성일**: 2025-08-30
- **버전**: 1.0
- **관련 문서**: 
  - [실행 환경 가이드](../execution-environment/expense-tracker-execution-environment.md)
  - [database-comprehensive-guide.md](./database-comprehensive-guide.md)