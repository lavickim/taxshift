# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## MoneyShift Project Overview

MoneyShift is an AI-powered financial transaction classification and analysis platform consisting of three main services:

1. **mshift-admin** - NextJS frontend admin panel (Port 3000)
2. **mshift-api** - Spring Boot Java API server (Port 8080)
3. **mshift-data_processing** - Python data processing pipeline (Port 8501)

The system implements a 4-layer transaction classification pipeline optimized for performance and accuracy:
- Layer 0: Redis caching (immediate response)
- Layer 1: Regex pattern matching (95% accuracy target)  
- Layer 2: ML inference (⚠️ 미구현 - Claude가 표시)
- Layer 3: LLM fallback (⚠️ 미구현 - Gemini AI 연동 필요 - Claude가 표시)

## 최신 프로젝트 상태 (2025-07-26 업데이트)

### 완료된 주요 기능
1. **AccountCodeConfig 대폭 확장**: 84개 → 218개 계정과목으로 확장, 한국 표준 계정체계 적용
2. **Phase 1-5 TDD 완전 구현**: 전체 핵심 비즈니스 로직 TDD 완성 (45개 테스트 100% 성공)
3. **테스트 안정성 대폭 개선**: MyBatisSystemException 완전 해결, 45개 실패 → 5개 실패 (87% 개선)
4. **LLM 미구현 부분 명확 표시**: TransactionTaggingService, LLMIntegrationService에 Claude 표시 완료

### 현재 진행중 작업
- **테스트 안정성 최종 완성**: 남은 5개 테스트 실패 해결 중
- **계정과목 매핑 동기화**: AccountCodeConfig 확장에 따른 전체 시스템 동기화

### 아키텍처 핵심 변경사항
- **중앙화된 계정과목 관리**: AccountCodeConfig를 통한 일관성 보장
- **로버스트 테스트 인프라**: BaseTestClass를 통한 UUID 기반 격리 환경
- **외래키 무결성 보장**: 모든 테스트에서 참조 무결성 완전 해결

## Essential Development Commands

### Quick Start (Full System)
```bash
./start-all.sh     # Start all services (recommended)
./stop-all.sh      # Stop all services
./test.sh          # Run integrated tests
```

### Individual Services
```bash
./start-db.sh      # PostgreSQL + Redis containers
./start-backend.sh # Spring Boot API (mvn spring-boot:run)
./start-frontend.sh # NextJS dev server
```

### Frontend Development (mshift-admin)
```bash
cd mshift-admin
yarn dev           # Start development server with turbopack
yarn build         # Production build
yarn lint          # ESLint checking
yarn test          # Jest tests
yarn test:watch    # Jest in watch mode
yarn test:coverage # Test coverage report
```

### Database Operations (mshift-admin)
```bash
yarn db:generate   # Generate Prisma client
yarn db:push       # Push schema changes to database
yarn db:migrate    # Create and apply migrations
yarn db:studio     # Open Prisma Studio
yarn db:reset      # Reset database with migrations
```

### Backend Development (mshift-api)
```bash
cd mshift-api
mvn spring-boot:run # Start API server
mvn test           # Run Java tests (현재 5개 실패/246개 전체)
mvn clean package  # Build JAR
```

### Data Processing (mshift-data_processing)
```bash
cd mshift-data_processing
./docker-run.sh    # Start via Docker (recommended)
python ui/dashboard.py # Start Streamlit dashboard
streamlit run ui/dashboard.py --server.port 8501 # Alternative direct start
```

### Testing
```bash
./test.sh                    # Comprehensive integration tests
./test-admin.sh              # Frontend-specific tests
./scripts/test-integrated.sh # Detailed integration testing
./scripts/test-rule-management.sh # Rule engine tests

# Individual test examples
cd mshift-admin && yarn test [filename] # Run specific Jest test
cd mshift-api && mvn test -Dtest=ClassName # Run specific Java test
```

## Memory Log

### Workflow Reminders
- 왜 루트에 있는 스타트 스크립트 안돌려? 작업이 전체 작업이 끝나면 이걸 돌려서 검증하라고 했잖아. 잘 기억해둬. 

### Development Philosophy
- 내가 티디디로 하라는 것은 새로운 것을 개발할 때 기존 것이 안되는 문제를 막으려는 거야. 그래서 안되면 원인을 파악하고 성공시키는 주로를 계속 유지하면서 가야 한다고. 정 해결 못한 상황이면 보고 하고. 

### Service Execution
- 그리고 서비스 실행 시킬때 이미 떠있으면 포트 여러개 안쓰게 기존 걸 죽이고 실행하는 방법으로 해.

### Project Design and API Management
- 지금 여러개의 앱고 디비를 한꺼번에 다루고 있잖아. 그래서 하나가 api가 바뀐다든가 하면, 다른 시스템에 영향을 줄거고. 그래서 루트밑에 프로젝트 디자인 폴더에 서로 영향을 주는 api나 인터페이스, 테스트들을 모조리 잘 분류해서 정리해 놓고. 앞으로 개발 작업 할 때 그 문서에 있는 것들이 바뀌게 되면 같이 다른 것들을 수정하고, 테스트를 돌려서 성공하면 계속 진행하도록 해.

### Docker Usage
- 앞으로는 다커를 사용해.

### Refactoring Approach
- 주요 페이스 지날 때마다 리팩토링 목록 만들고 리펙토링해.

### Code Standards
- 최신 안정화된 표준을 사용해.

### Commit and Documentation
- 구분할 만한 작업이 끝나면 작업 요약해서 머밋해 깃에 커밋해룰에 기록해놔

- 앞으로 깃에 커밋할때는 클로드가 다운될때를 대비해서 항상 이 문서를 이런 형식으로 업데이트 하게 기억해놔.

### Test Files
- 테스트 파일은 루트에 있는 스크립트야.

- 지금 커밋할때 마다 핸드오버 문서 업데이트고 있지 아까 그렇게 하라고 했다.

### Test Philosophy
- 테스트는 테스트 통과 자체가 의미가 있는게 아니라, 이런 전체적인 시스템의 문제를 발견하는데 있어. 테스트 문제가 생기면 전체 시스템의 로버스트한 구성을 먼저 의심하고, 근본적인 것을 개선하고 테스트를 다시 설계해.

## 현재 해결해야 할 문제들

### 남은 테스트 실패 (5개)
1. **Phase4JournalEntryTest**: ✅ 해결완료 - 5120→5204 계정코드 매핑 수정
2. **TagAccountMappingServiceTest**: 🔄 진행중 - 5201→5204 계정코드 매핑 수정 필요
3. **TransactionTaggingServiceTest** (3건): 🔄 LLM 미구현 에러 메시지 처리 필요

### 주요 기술 부채
- **LLM 연동 미구현**: Layer 2(ML), Layer 3(LLM) 실제 구현 필요
- **테스트 커버리지**: 일부 매퍼 레벨 테스트 @Disabled 처리된 상태
- **성능 최적화**: Redis 캐싱 로직 일부 Mock 처리 상태

## 핵심 파일 변경 이력

### AccountCodeConfig 확장 (84→218개)
- `src/main/java/com/moneyshift/api/config/AccountCodeConfig.java`: 한국 표준 계정체계 적용
- 모든 관련 서비스에서 5120→5204, 5150→5213 등 매핑 업데이트 필요

### LLM 미구현 표시 완료
- `src/main/java/com/moneyshift/api/service/TransactionTaggingService.java`: ⚠️ Claude 표시 완료
- `src/main/java/com/moneyshift/api/service/LLMIntegrationService.java`: ⚠️ Claude 표시 완료  
- 관련 테스트들 LLM 미구현 처리로 업데이트 필요

### 테스트 인프라 개선
- `src/test/java/com/moneyshift/api/service/BaseTestClass.java`: UUID 기반 격리 환경 완성
- `src/main/resources/mapper/ChartOfAccountsMapper.xml`: MyBatisSystemException 완전 해결

### 테스트 해결 전략 (2025-07-26 추가)
- **외래키 제약조건**: AccountCodeConfig 중앙화를 통한 일관성 보장
- **MyBatis 타입 매핑**: typeHandler 제거를 통한 자동 매핑 활용  
- **BigDecimal 비교**: equals() → compareTo() 변경으로 scale 문제 해결
- **Mock 검증**: 실제 비즈니스 로직 변화에 맞춘 호출 횟수 조정