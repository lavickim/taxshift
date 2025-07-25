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
- Layer 2: ML inference (future integration)
- Layer 3: LLM fallback (Gemini AI)

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
mvn test           # Run Java tests
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