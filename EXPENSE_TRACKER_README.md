# 편한가계부 클론 앱 - MoneyShift Expense Tracker

## 프로젝트 개요
한국의 인기 가계부 앱 "편한가계부"의 픽셀 퍼펙트 클론 앱입니다.
다크 테마 기반의 세련된 UI와 완벽한 가계부 기능을 제공합니다.

## 기술 스택

### Backend
- Spring Boot 3.2.7
- Java 21
- PostgreSQL
- JPA/Hibernate
- Redis (캐싱)
- JWT 인증

### Frontend
- Flutter 3.35.1
- Material Design
- HTTP API 연동
- 다크 테마 UI

## 주요 기능

### ✅ 완료된 기능 (Step 1-15)

1. **데이터베이스 설계 및 구축**
   - PostgreSQL 도커 컨테이너
   - et_ 프리픽스 테이블 구조
   - 사용자, 거래, 카테고리, 자산 테이블

2. **백엔드 API 구현**
   - RESTful API 설계
   - 사용자 관리 API
   - 거래(수입/지출) CRUD API
   - 카테고리 관리 API
   - 자산 관리 API
   - 통계 및 리포트 API

3. **Flutter 앱 구현**
   - 다크 테마 UI 프레임워크
   - 메인 캘린더 화면 (7x6 그리드)
   - 거래 입력 화면 (숫자패드 포함)
   - 자산 관리 화면
   - 통계 화면 (카테고리별, 추세, 비교)
   - 카테고리 관리 화면
   - 설정 및 더보기 화면

4. **핵심 기능**
   - 월별 캘린더 뷰
   - 수입/지출 빠른 입력
   - 실시간 잔액 업데이트
   - 카테고리별 통계
   - 자산별 관리
   - 거래 내역 조회

## 실행 방법

### 1. 백엔드 실행
```bash
cd mshift-expense-backend
mvn spring-boot:run
```
- 포트: 8090
- API 문서: http://localhost:8090/swagger-ui.html

### 2. Flutter 앱 실행
```bash
cd mshift_expense_flutter
flutter pub get
flutter run
```

### 3. 데이터베이스
```bash
# Docker PostgreSQL 실행
docker run -d \
  --name postgres-expense \
  -e POSTGRES_DB=expense_tracker \
  -e POSTGRES_USER=expense_user \
  -e POSTGRES_PASSWORD=expense_pass \
  -p 5432:5432 \
  postgres:15
```

## API 엔드포인트

### 사용자 관리
- POST /api/v1/users - 사용자 생성
- GET /api/v1/users/{id} - 사용자 조회
- PUT /api/v1/users/{id} - 사용자 수정

### 거래 관리
- POST /api/v1/transactions - 거래 생성
- GET /api/v1/transactions/monthly/{year}/{month} - 월별 거래 조회
- GET /api/v1/transactions/statistics/daily/{year}/{month} - 일별 통계
- GET /api/v1/transactions/statistics/monthly/{year}/{month} - 월별 통계
- PUT /api/v1/transactions/{id} - 거래 수정
- DELETE /api/v1/transactions/{id} - 거래 삭제

### 카테고리 관리
- GET /api/v1/categories - 카테고리 목록
- POST /api/v1/categories - 카테고리 생성
- PUT /api/v1/categories/{id} - 카테고리 수정
- DELETE /api/v1/categories/{id} - 카테고리 삭제

### 자산 관리
- GET /api/v1/assets - 자산 목록
- POST /api/v1/assets - 자산 생성
- PUT /api/v1/assets/{id} - 자산 수정
- DELETE /api/v1/assets/{id} - 자산 삭제

## 화면 구성

### 메인 화면 (HomeScreen)
- 상단: 월 네비게이션
- 중앙: 7x6 캘린더 그리드
- 일별 수입/지출 표시
- 하단: 오늘 날짜 및 거래 요약

### 통계 화면 (StatisticsScreen)
- 카테고리별 분석
- 일별 추세 그래프
- 월별 비교

### 자산 화면 (AssetsScreen)
- 총 자산 표시
- 자산별 잔액
- 자산 추가/수정/삭제

### 거래 입력 화면 (AddTransactionScreen)
- 금액 입력 (커스텀 숫자패드)
- 카테고리 선택
- 자산 선택
- 날짜/시간 선택
- 메모 입력

### 더보기 화면 (MoreScreen)
- 카테고리 관리
- 백업 및 복원
- 설정
- 앱 정보

## 디자인 특징

### 색상 팔레트
- 배경: #000000 (검정)
- 카드 배경: #1A1A1A
- 주요 색상:
  - 빨간색 (지출): #FF5757
  - 파란색 (수입): #4A90E2
  - 노란색 (강조): #FFD700
  - 초록색 (자산): #4CAF50

### 타이포그래피
- 제목: 18-32px
- 본문: 14px
- 캡션: 11-12px
- 금액: 16-28px (bold)

## 프로젝트 구조

```
moneyshift/
├── mshift-expense-backend/    # Spring Boot 백엔드
│   ├── src/main/java/
│   │   └── com/moneyshift/expense/
│   │       ├── controller/    # REST API 컨트롤러
│   │       ├── service/       # 비즈니스 로직
│   │       ├── repository/    # JPA 레포지토리
│   │       ├── entity/        # JPA 엔티티
│   │       └── dto/           # 데이터 전송 객체
│   └── pom.xml
│
└── mshift_expense_flutter/    # Flutter 프론트엔드
    ├── lib/
    │   ├── main.dart          # 앱 진입점
    │   ├── screens/           # 화면 구성
    │   ├── widgets/           # 재사용 가능 위젯
    │   └── constants/         # 색상, 타이포그래피
    └── pubspec.yaml
```

## 개발 완료 현황
- ✅ Step 1: 데이터베이스 스키마 구축
- ✅ Step 2: 백엔드 Entity 및 Repository 구현
- ✅ Step 3: 백엔드 Service 레이어 구현
- ✅ Step 4: REST API 컨트롤러 구현
- ✅ Step 5: Flutter 다크 테마 UI 프레임워크
- ✅ Step 6: 메인 캘린더 화면 완성
- ✅ Step 7: 거래 입력 화면 구현
- ✅ Step 8: API 연동 및 상태 관리
- ✅ Step 9: 자산 관리 화면
- ✅ Step 10: 통계 화면
- ✅ Step 11: 카테고리 관리
- ✅ Step 12: 설정 및 부가 기능
- ✅ Step 13: 성능 최적화
- ✅ Step 14: 테스트 및 버그 수정
- ✅ Step 15: 최종 마무리

## 라이선스
이 프로젝트는 학습 목적으로 제작되었습니다.

---
Generated with Claude Code (claude.ai/code)
2025-08-27