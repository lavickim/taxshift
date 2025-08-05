# 🎯 MoneyShift Trojan Horse System - 완전 구현 가이드

## 📋 프로젝트 개요

MoneyShift Trojan Horse는 실제 거래 데이터 수집을 위한 전략적 가계부 앱입니다. 사용자에게는 유용한 무료 가계부 서비스를 제공하고, MoneyShift에게는 거래 분류 엔진 학습을 위한 양질의 실제 데이터를 수집합니다.

### 🎯 핵심 전략
- **1차 목표**: 95% OCR 정확도의 무료 영수증 가계부 앱으로 사용자 확보
- **2차 목표**: 실제 거래 데이터 수집으로 MoneyShift 분류 엔진 정확도 향상
- **3차 목표**: 프리미엄 구독 모델을 통한 수익 창출

## 🏗️ 시스템 아키텍처

### 프론트엔드 (React Native)
```
mshift-trojan-app/
├── src/
│   ├── navigation/          # 네비게이션 설정
│   ├── screens/            # 화면 컴포넌트
│   │   ├── HomeScreen.tsx           # 메인 대시보드
│   │   ├── CameraScreen.tsx         # 영수증 촬영
│   │   ├── TransactionListScreen.tsx # 거래 내역
│   │   └── SettingsScreen.tsx       # 설정
│   ├── components/         # 재사용 컴포넌트
│   ├── services/          # API 서비스
│   ├── store/             # Redux 상태 관리
│   │   └── slices/
│   │       ├── userSlice.ts         # 사용자 상태
│   │       ├── receiptSlice.ts      # 영수증 상태
│   │       └── dashboardSlice.ts    # 대시보드 상태
│   ├── types/             # TypeScript 타입
│   ├── config/            # 설정 파일
│   └── constants/         # 상수
```

### 백엔드 (Spring Boot)
```
mshift-trojan-backend/
├── src/main/java/com/moneyshift/trojan/
│   ├── controller/        # REST API 컨트롤러
│   │   ├── ReceiptController.java   # 영수증 업로드/처리
│   │   ├── ExportController.java    # 데이터 내보내기
│   │   └── UserController.java      # 사용자 관리
│   ├── service/           # 비즈니스 로직
│   │   ├── OcrService.java          # OCR 처리
│   │   ├── ExcelExportService.java  # 엑셀 내보내기
│   │   └── GamificationService.java # 게이미피케이션
│   ├── model/             # 데이터 모델
│   │   ├── User.java               # 사용자 모델
│   │   ├── Receipt.java            # 영수증 모델
│   │   └── Transaction.java        # 거래 모델
│   └── security/          # 보안 설정
└── src/main/resources/
    ├── application.yml    # 애플리케이션 설정
    └── schema.sql         # 데이터베이스 스키마
```

### 관리자 패널 (NextJS)
```
mshift-admin/
└── components/
    └── trojan-horse-management.tsx  # Trojan Horse 관리 대시보드
```

## 🗄️ 데이터베이스 스키마

### 핵심 테이블

#### users - 사용자 관리
- 기본 정보: id, email, name, password_hash
- 구독 정보: is_premium, subscription_type
- 개인정보 동의: data_collection_consent, marketing_consent
- 게이미피케이션: current_level, total_points, current_badge
- 디바이스 분석: device_type, app_version, os_version

#### receipts - 영수증 데이터 수집
- 이미지: original_image_url, processed_image_url, image_hash
- OCR 결과: raw_ocr_text, ocr_confidence, ocr_metadata
- 비즈니스 정보: merchant_name, merchant_address, business_registration_number
- 거래 상세: total_amount, tax_amount, payment_method
- 분류: category, subcategory, tags
- 품질 지표: image_quality_score, data_completeness_score

#### transactions - 거래 데이터
- 기본 정보: amount, description, category, transaction_date, type
- 결제 정보: payment_method, account_number, bank_name
- 위치 데이터: merchant_name, location, latitude, longitude
- 분류: tags, notes, confidence
- 검증: is_verified, verified_at

#### analytics_events - 사용자 행동 추적
- 이벤트: event_type, event_category, event_data
- 컨텍스트: screen_name, feature_used
- 성능: processing_time_ms, success, error_code

## 🔧 주요 기능

### 1. 영수증 OCR 처리
```java
@Service
public class OcrService {
    public OcrResult processReceiptImage(MultipartFile imageFile) {
        // 한국어 영수증 패턴 인식
        // 가맹점명, 금액, 날짜, 결제방법 추출
        // 신뢰도 계산 및 구조화된 데이터 반환
    }
}
```

**특징:**
- 한국 영수증 패턴 최적화 (스타벅스, 김밥천국, 편의점 등)
- 95% 이상 OCR 정확도 목표
- 자동 카테고리 분류
- 중복 영수증 감지

### 2. 실시간 대시보드
```typescript
const HomeScreen = () => {
    // 이번 달 수입/지출 요약
    // 최근 거래 내역 (5건)
    // 빠른 작업 버튼 (영수증 촬영, 수입/지출 입력, 엑셀 다운로드)
    // 게이미피케이션 요소 (레벨, 목표 달성률)
}
```

### 3. 데이터 내보내기
```java
@RestController
public class ExportController {
    @GetMapping("/excel")
    public ResponseEntity<byte[]> exportToExcel() {
        // 거래내역, 영수증데이터, 카테고리분석 시트
        // 한국어 최적화된 엑셀 포맷
        // 사용자 편의성 극대화
    }
}
```

### 4. 게이미피케이션 시스템
```java
@Service
public class GamificationService {
    // 영수증 업로드 달성도 (1, 10, 50, 100장)
    // 레벨 시스템 (1-10레벨)
    // 배지 시스템 (BEGINNER → COLLECTOR → EXPERT → MASTER)
    // 주간 목표 시스템
}
```

### 5. 프리미엄 기능
- 무제한 영수증 저장 (무료: 월 50장 제한)
- 고급 분석 및 리포트
- 자동 은행 연동 (향후 추가)
- 우선 고객 지원

## 📊 관리자 대시보드

### Trojan Horse 데이터 수집 현황
- **총 사용자**: 실시간 사용자 통계
- **수집된 영수증**: OCR 처리 현황 및 정확도
- **프리미엄 전환율**: 구독 모델 성과
- **데이터 품질**: OCR 신뢰도, 완성도, 중복 제거율

### 데이터 내보내기 시스템
```typescript
const exportDataForMoneyShift = () => {
    // 데이터 수집 동의한 사용자만 선별
    // 개인 식별 정보 완전 제거
    // MoneyShift 분류 엔진 학습용 데이터 생성
    // JSON/CSV 형태로 익명화된 거래 패턴 내보내기
}
```

## 🚀 배포 및 실행

### 데이터베이스 설정
```sql
CREATE DATABASE moneyshift_trojan;
CREATE DATABASE moneyshift_trojan_test;
-- schema.sql 실행으로 테이블 생성
```

### 백엔드 실행
```bash
cd mshift-trojan-backend
mvn spring-boot:run
# http://localhost:8081에서 실행
```

### 프론트엔드 실행
```bash
cd mshift-trojan-app
npm install
npx expo start
```

### 관리자 패널 추가
```typescript
// mshift-admin/app/page.tsx에 추가
import TrojanHorseManagement from '@/components/trojan-horse-management';

<Tabs>
  <TabsContent value="trojan-horse">
    <TrojanHorseManagement />
  </TabsContent>
</Tabs>
```

## 📈 비즈니스 성과 목표

### 6개월 목표
- **MAU 50,000명**: 월간 활성 사용자
- **영수증 수집**: 월 500,000장 이상
- **프리미엄 전환율**: 5% (2,500명)
- **OCR 정확도**: 95% 이상 유지
- **데이터 동의율**: 85% 이상

### 1년 목표
- **MAU 200,000명**: 4배 성장
- **수익**: 월 2,500만원 (프리미엄 구독)
- **MoneyShift 정확도**: 수집된 데이터로 85% → 92% 향상
- **B2B 확장**: 수집된 데이터 기반 기업 서비스 출시

## 🔒 개인정보 보호

### 데이터 수집 원칙
1. **명시적 동의**: 모든 데이터 수집에 대한 사용자 동의
2. **목적 제한**: 서비스 개선 목적으로만 사용
3. **익명화 처리**: 개인 식별 정보 완전 제거
4. **보안**: 암호화 저장 및 전송
5. **삭제권**: 사용자 요청 시 즉시 삭제

### GDPR/개인정보보호법 준수
- 동의 관리 시스템
- 데이터 처리 투명성
- 사용자 권리 보장 (열람, 정정, 삭제)
- 데이터 보호 영향 평가

## 🎯 마케팅 전략

### 진입 전략
1. **무료 가치 제공**: 영수증 OCR + 자동 엑셀 생성
2. **사용 편의성**: 촬영만으로 완전 자동화
3. **게이미피케이션**: 레벨업, 배지, 목표 달성

### 성장 전략
1. **바이럴 기능**: 가족/친구 초대 시 프리미엄 혜택
2. **인플루언서 마케팅**: 가계부 인플루언서 협력
3. **SEO/ASO**: "영수증 가계부", "OCR 가계부" 키워드 최적화

### 수익화 전략
1. **프리미엄 구독**: 월 9,900원 (연간 할인 제공)
2. **기업 솔루션**: 수집된 데이터 기반 B2B 서비스
3. **광고 모델**: 타겟팅된 금융 상품 광고

## 📋 개발 체크리스트

### ✅ 완료된 작업
- [x] React Native 앱 구조 구현
- [x] Spring Boot 백엔드 API 구현
- [x] PostgreSQL 데이터베이스 스키마 설계
- [x] OCR 영수증 처리 시스템
- [x] 사용자 인증 및 데이터 수집 시스템
- [x] 관리자 대시보드 구현
- [x] Excel/CSV 내보내기 기능
- [x] 게이미피케이션 시스템
- [x] 개인정보 보호 시스템

### 🔄 향후 개선 사항
- [ ] Google Cloud Vision API 실제 연동
- [ ] 실제 결제 시스템 연동 (프리미엄)
- [ ] 푸시 알림 시스템
- [ ] 은행 API 연동 (오픈뱅킹)
- [ ] AI 기반 지출 패턴 분석
- [ ] 가족 공유 가계부 기능

## 🤖 MoneyShift 연동

### 데이터 활용 시나리오
1. **실제 거래 문자열 수집**: 수천 개의 실제 한국 거래 패턴
2. **분류 정확도 향상**: 85% → 92% 목표
3. **새로운 패턴 발견**: 기존에 없던 가맹점/카테고리 발견
4. **지역별 소비 패턴**: 위치 데이터 기반 인사이트
5. **시즌별 트렌드**: 시간대별 소비 패턴 분석

### 기술적 통합
```java
// MoneyShift 메인 시스템에서 Trojan Horse 데이터 활용
@Service
public class ImprovedTransactionClassifier {
    // Trojan Horse에서 수집된 실제 데이터로 학습된 모델 사용
    // 정확도 대폭 향상된 거래 분류 엔진
}
```

---

## 🎯 결론

MoneyShift Trojan Horse 시스템은 사용자에게는 진정한 가치를 제공하는 무료 가계부 앱이면서, 동시에 MoneyShift의 핵심 서비스 품질 향상을 위한 전략적 데이터 수집 플랫폼입니다.

**핵심 성공 요인:**
1. **사용자 만족도**: 95% OCR 정확도와 편리한 UX
2. **데이터 품질**: 실제 사용자의 진짜 거래 데이터
3. **개인정보 보호**: 투명하고 안전한 데이터 처리
4. **비즈니스 모델**: 지속 가능한 프리미엄 구독 수익

이 시스템을 통해 MoneyShift는 한국 시장에서 가장 정확한 거래 분류 엔진을 구축하고, 궁극적으로 개인 금융 관리의 새로운 표준을 제시할 수 있을 것입니다.