# 편한가계부 클론 앱 단계별 개발 계획 - V0.6
## Step-by-Step Development Plan

---

## 📋 프로젝트 정보

- **Flutter 앱**: `/Users/lavickim/_Dev/moneyshift/mshift_expense_flutter`
- **백엔드**: `/Users/lavickim/_Dev/moneyshift/mshift-expense-backend`
- **Java 버전**: Java 21 (필수)
- **Flutter 버전**: 3.35.1
- **개발 방식**: 단계별 개발 → 테스트 → 커밋 반복

---

## 🎯 개발 단계 (Steps)

### Step 1: 데이터베이스 스키마 구축
**목표**: PostgreSQL에 완전한 데이터베이스 구조 생성

**작업 내용**:
1. PostgreSQL 데이터베이스 초기화
2. 8개 핵심 테이블 생성
   - users
   - assets
   - categories
   - transactions
   - budgets
   - recurring_templates
   - notifications
   - user_settings
3. 인덱스 및 외래키 설정
4. 샘플 데이터 삽입

**테스트**: 
- 모든 테이블 생성 확인
- 샘플 데이터 CRUD 테스트

**커밋 메시지**: "feat: PostgreSQL 데이터베이스 스키마 구축 완료"

---

### Step 2: 백엔드 Entity 및 Repository 구현
**목표**: JPA Entity와 Repository 레이어 구축

**작업 내용**:
1. JPA Entity 클래스 생성
   - User.java
   - Asset.java
   - Category.java
   - Transaction.java
   - Budget.java
2. Repository 인터페이스 생성
3. DTO 클래스 정의
4. Mapper 구현

**테스트**:
- Repository 단위 테스트
- 데이터베이스 연동 확인

**커밋 메시지**: "feat: JPA Entity 및 Repository 구현"

---

### Step 3: 백엔드 Service 레이어 구현
**목표**: 비즈니스 로직 구현

**작업 내용**:
1. TransactionService
   - 거래 CRUD
   - 월별/일별 조회
   - 통계 계산
2. AssetService
   - 자산 관리
   - 잔액 계산
3. CategoryService
4. UserService

**테스트**:
- Service 단위 테스트
- 비즈니스 로직 검증

**커밋 메시지**: "feat: Service 레이어 비즈니스 로직 구현"

---

### Step 4: REST API 컨트롤러 구현
**목표**: RESTful API 엔드포인트 생성

**작업 내용**:
1. TransactionController
   - GET/POST/PUT/DELETE /api/v1/transactions
   - GET /api/v1/transactions/monthly/{year}/{month}
2. AssetController
3. CategoryController
4. AuthController

**테스트**:
- Postman/curl로 API 테스트
- 응답 형식 검증

**커밋 메시지**: "feat: REST API 컨트롤러 구현"

---

### Step 5: Flutter 다크 테마 UI 프레임워크
**목표**: 다크 테마 기반 UI 구조 설정

**작업 내용**:
1. 색상 테마 정의 (colors.dart)
2. 텍스트 스타일 정의 (typography.dart)
3. 공통 위젯 생성
   - CustomAppBar
   - BottomNavigation
   - FloatingActionButtons

**테스트**:
- 다크 테마 적용 확인
- 모든 화면에서 일관된 스타일

**커밋 메시지**: "feat: Flutter 다크 테마 UI 프레임워크 구축"

---

### Step 6: 메인 캘린더 화면 완성
**목표**: 메인 화면 100% 구현

**작업 내용**:
1. 상단 네비게이션 바 (월 선택, 아이콘들)
2. 5개 탭 메뉴 (일일/달력/월별/결산/메모)
3. 수입/지출/합계 표시 영역
4. 7×6 캘린더 그리드
5. 하단 날짜 정보 바
6. 하단 네비게이션
7. 이중 플로팅 액션 버튼

**테스트**:
- 스크린샷과 픽셀 단위 비교
- 월 이동 기능 테스트

**커밋 메시지**: "feat: 메인 캘린더 화면 완벽 구현"

---

### Step 7: 거래 입력 화면 구현
**목표**: 수입/지출 입력 화면 완성

**작업 내용**:
1. 3개 탭 (수입/지출/이체)
2. 입력 필드
   - 날짜 선택기
   - 금액 입력
   - 카테고리 선택
   - 자산 선택
   - 내용 입력
   - 메모
3. 4×4 숫자 키패드
4. 카메라 연동

**테스트**:
- 거래 입력 및 저장
- 숫자 키패드 동작

**커밋 메시지**: "feat: 거래 입력 화면 및 숫자 키패드 구현"

---

### Step 8: API 연동 및 상태 관리
**목표**: Flutter-Backend 완전 연동

**작업 내용**:
1. API Service 클래스 구현
2. Provider/Riverpod 상태 관리
3. 로컬 캐싱 (SQLite)
4. 오프라인 지원

**테스트**:
- API 호출 및 응답
- 데이터 실시간 반영
- 오프라인 모드 테스트

**커밋 메시지**: "feat: Flutter-Backend API 연동 완료"

---

### Step 9: 자산 관리 화면
**목표**: 자산(계좌) 관리 기능 구현

**작업 내용**:
1. 자산 목록 화면
2. 자산 추가/수정/삭제
3. 은행별 그룹핑
4. 잔액 표시

**테스트**:
- 자산 CRUD 동작
- 잔액 계산 정확성

**커밋 메시지**: "feat: 자산 관리 화면 구현"

---

### Step 10: 통계 화면
**목표**: 통계 및 분석 화면 구현

**작업 내용**:
1. 월별 통계 뷰
2. 카테고리별 분석
3. 그래프 차트 (fl_chart)
4. 기간 비교

**테스트**:
- 통계 데이터 정확성
- 차트 렌더링

**커밋 메시지**: "feat: 통계 분석 화면 구현"

---

### Step 11: 카테고리 관리
**목표**: 카테고리 커스터마이징

**작업 내용**:
1. 기본 카테고리 제공
2. 사용자 정의 카테고리
3. 아이콘 선택
4. 색상 선택

**테스트**:
- 카테고리 CRUD
- 거래 입력 시 반영

**커밋 메시지**: "feat: 카테고리 관리 기능 구현"

---

### Step 12: 설정 및 부가 기능
**목표**: 설정 화면 및 부가 기능

**작업 내용**:
1. 설정 화면
2. 알림 설정
3. 백업/복원
4. 앱 정보

**테스트**:
- 설정 저장 및 적용
- 백업/복원 동작

**커밋 메시지**: "feat: 설정 및 부가 기능 구현"

---

### Step 13: 성능 최적화
**목표**: 앱 성능 개선

**작업 내용**:
1. 이미지 최적화
2. 레이지 로딩
3. 캐싱 전략
4. 메모리 관리

**테스트**:
- 앱 시작 시간 < 2초
- 화면 전환 < 200ms

**커밋 메시지**: "perf: 성능 최적화 완료"

---

### Step 14: 테스트 및 버그 수정
**목표**: 전체 기능 검증

**작업 내용**:
1. 단위 테스트
2. 통합 테스트
3. E2E 테스트
4. 버그 수정

**테스트**:
- 모든 시나리오 테스트
- 엣지 케이스 처리

**커밋 메시지**: "test: 테스트 커버리지 완성 및 버그 수정"

---

### Step 15: 최종 마무리
**목표**: 배포 준비

**작업 내용**:
1. 코드 정리
2. 문서화
3. 빌드 최적화
4. APK 생성

**테스트**:
- 최종 QA
- 실기기 테스트

**커밋 메시지**: "release: v0.6 배포 준비 완료"

---

## 🚀 실행 계획

### 일일 작업 프로세스
1. **계획**: 해당 Step의 작업 내용 확인
2. **개발**: 코드 구현
3. **테스트**: 기능 테스트 실행
4. **검증**: 요구사항 충족 확인
5. **커밋**: Git 커밋 및 푸시

### 진행 상황 추적
- TodoWrite 도구로 진행 상황 관리
- 각 Step 완료 시 체크리스트 업데이트
- 문제 발생 시 즉시 기록 및 해결

### 테스트 명령어
```bash
# 백엔드 테스트
cd mshift-expense-backend
mvn test

# Flutter 테스트
cd mshift_expense_flutter
flutter test
flutter run

# API 테스트
curl http://localhost:8090/api/v1/transactions
```

### Git 워크플로우
```bash
# 작업 시작
git status
git pull

# 개발 후
git add .
git commit -m "feat: [Step N] 설명"
git push

# 태그 추가 (주요 마일스톤)
git tag -a step-N -m "Step N 완료"
git push --tags
```

---

## 📊 진행 상황 체크리스트

- [ ] Step 1: 데이터베이스 스키마 구축
- [ ] Step 2: 백엔드 Entity 및 Repository 구현
- [ ] Step 3: 백엔드 Service 레이어 구현
- [ ] Step 4: REST API 컨트롤러 구현
- [ ] Step 5: Flutter 다크 테마 UI 프레임워크
- [ ] Step 6: 메인 캘린더 화면 완성
- [ ] Step 7: 거래 입력 화면 구현
- [ ] Step 8: API 연동 및 상태 관리
- [ ] Step 9: 자산 관리 화면
- [ ] Step 10: 통계 화면
- [ ] Step 11: 카테고리 관리
- [ ] Step 12: 설정 및 부가 기능
- [ ] Step 13: 성능 최적화
- [ ] Step 14: 테스트 및 버그 수정
- [ ] Step 15: 최종 마무리

---

## 📝 프로젝트 지식

### 중요 원칙
1. **Java 21 필수 사용** - 백엔드는 반드시 Java 21 사용
2. **단계별 개발** - 각 Step 완료 후 테스트 및 커밋
3. **픽셀 퍼펙트** - 스크린샷과 100% 일치하는 UI
4. **테스트 우선** - 모든 기능은 테스트 후 커밋

### 기술 스택
- **Frontend**: Flutter 3.35.1 + Dart
- **Backend**: Spring Boot 3.2.7 + Java 21
- **Database**: PostgreSQL + H2 (개발)
- **API**: RESTful JSON API

### 파일 경로
- Flutter 앱: `/Users/lavickim/_Dev/moneyshift/mshift_expense_flutter`
- 백엔드: `/Users/lavickim/_Dev/moneyshift/mshift-expense-backend`
- 설계 문서: `/Users/lavickim/_Dev/moneyshift/project-design/expense-tracker`

---

**문서 버전**: V0.6
**작성일**: 2025년 8월 26일