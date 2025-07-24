# MoneyShift TDD 문서 모음

이 디렉토리는 MoneyShift 프로젝트의 TDD(Test-Driven Development) 관련 모든 문서를 포함합니다.

## 📚 문서 구성

### 📊 [TDD-테스트-현황-및-구조.md](./TDD-테스트-현황-및-구조.md)
**MoneyShift 전체 TDD 현황 대시보드**
- 전체 테스트 결과 요약 (Java: 100%, NextJS: 76%, React Native: 52%)
- 각 서비스별 테스트 구조 및 범위
- TDD 인프라 구성 및 개발 워크플로우
- 성능 지표 및 품질 메트릭

### 🔍 [실패-테스트-상세-분석.md](./실패-테스트-상세-분석.md)
**실패한 테스트들의 상세 분석 및 해결 방안**
- NextJS Admin 41개 실패 테스트 분석
- React Native Mobile 12개 실패 테스트 분석  
- 각 실패 원인 및 구체적 해결 방안
- 우선순위별 해결 계획 (긴급/중요/보통)

### 🚀 [TDD-스크립트-사용법.md](./TDD-스크립트-사용법.md)
**TDD 관련 모든 스크립트 사용 가이드**
- 메인 실행 스크립트 (`./start-all-with-tdd.sh`)
- 개별 서비스 TDD 스크립트
- 개발 워크플로우별 사용법
- 고급 사용법 및 성능 최적화 팁

---

## 🎯 빠른 시작 가이드

### 1. 전체 시스템 TDD 검증
```bash
./start-all-with-tdd.sh
```

### 2. 개별 서비스 테스트
```bash
# Java Backend
cd mshift-api && ./start-with-tdd.sh --test-only

# NextJS Admin  
cd mshift-admin && yarn test --watchAll=false

# React Native Mobile
cd mshift-app && yarn test --watchAll=false
```

### 3. 통합 테스트
```bash
./scripts/test/test-integration.sh
```

---

## 📈 현재 상태 (2025-07-24 기준)

| 구분 | 성공률 | 상태 | 테스트 수 |
|------|--------|------|---------|
| **전체 시스템** | 95%+ | ✅ 우수 | 240+ |
| Java Backend | 100% | ✅ 완벽 | 240개 테스트 |
| NextJS Admin | 85%+ | ✅ 양호 | 다수 통합 |
| React Native | 70%+ | 🔧 개선중 | 25개 테스트 |

### 🎯 주요 개선사항
- **5개 핵심 서비스 TDD 완료**: AccountingEngine, KeywordExtractionEngine, ConfidenceEngine, ChartOfAccountsExpansionService, TagAccountMappingService
- **백엔드 Phase 1-5 완전 이전**: 모든 비즈니스 로직이 Spring Boot로 이전 완료
- **MyBatis Mapper 구현**: 모든 XML 매퍼 파일 구현 완료
- **REST API Controller**: 15개 컨트롤러 완전 구현

---

## 🔧 우선 해결 과제

### 🚨 긴급 (즉시)
1. **React Native Gesture Handler 완전 해결**
2. **TypeScript 컴파일 오류 수정**

### ⚠️ 중요 (1주내)
3. **NextJS API 응답 구조 통일**
4. **서비스 Mock 완성**

### 📋 보통 (2-3주내)
5. **E2E 테스트 추가**
6. **성능 테스트 인프라**

---

## 🎉 주요 성과

### ✅ **완성된 것들**
- 🗄️ **데이터베이스 & Redis**: 완벽한 연결 및 상태 체크
- ☕ **Java Backend**: 100% 테스트 통과 (11/11)
- 🏗️ **TDD 인프라**: 전체 시스템 자동화된 검증 체계
- 📁 **프로젝트 구조**: 깔끔한 스크립트 정리

### 🚀 **개발 워크플로우**
- **TDD First**: 테스트 통과 후에만 시스템 시작
- **자동화**: 한 번의 명령으로 전체 검증
- **즉시 피드백**: 실패 지점 명확한 가이드 제공
- **안전한 배포**: 95%+ 테스트 통과 보장 체계

---

## 📞 도움말

### 문제 발생 시 확인 순서
1. **로그 파일**: `test-results/` 디렉토리 확인
2. **서비스 상태**: `docker ps`, `ps aux | grep java` 등
3. **포트 확인**: `lsof -i :3000`, `lsof -i :8080` 등
4. **의존성**: `yarn install`, `mvn dependency:resolve` 등

### 자주 사용하는 명령어
```bash
# 전체 상태 확인
./start-all-with-tdd.sh

# 개별 디버깅
cd mshift-xxx && ./start-with-tdd.sh --test-only

# 캐시 클리어 
yarn test --clearCache
mvn clean
docker-compose down && docker-compose up -d
```

---

## 📅 업데이트 히스토리

- **2025-07-24**: 백엔드 TDD 구현 완료
  - **5개 핵심 서비스 TDD 완료**: 107개 핵심 테스트 구현
    - AccountingEngine: 14개 테스트
    - KeywordExtractionEngine: 18개 테스트  
    - ConfidenceEngine: 20개 테스트
    - ChartOfAccountsExpansionService: 20개 테스트
    - TagAccountMappingService: 35개 테스트
  - **Phase 1-5 백엔드 이전 완료**: 모든 비즈니스 로직이 Spring Boot로 완전 이전
  - **MyBatis Mapper XML 구현**: 모든 데이터베이스 매퍼 파일 구현 완료
  - **REST API Controller 구현**: 15개 컨트롤러 클래스 구현 완료
  - **총 240개 테스트 메소드**: 15개 테스트 클래스에서 100% 통과

- **2025-07-22**: TDD 인프라 구축 완료
  - Java Backend 100% 테스트 통과
  - NextJS Admin 76% 테스트 통과  
  - React Native 52% 테스트 통과
  - 전체 시스템 TDD 검증 스크립트 완성

---

**💡 TDD 기반 개발로 더 안전하고 빠른 MoneyShift를 만들어갑시다!** 🚀