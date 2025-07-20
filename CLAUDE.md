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
./start-frontend.sh # NextJS dev server (yarn dev)
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

## Project Architecture

### Service Communication
- **Frontend ↔ Backend**: REST API communication via NextJS API routes that proxy to Spring Boot
- **Database Sharing**: PostgreSQL shared between frontend (Prisma) and backend (MyBatis)
- **Caching**: Redis for high-performance transaction classification
- **Data Pipeline**: Independent Python service for external data processing

### Key Technologies
- **Frontend**: NextJS 15, React 19, TypeScript, Tailwind CSS, Prisma ORM, Radix UI
- **Backend**: Spring Boot 3.2.7, Java 17, MyBatis, PostgreSQL, Redis
- **Data Processing**: Python, Streamlit, Jupyter, Pandas
- **Testing**: Jest (frontend), JUnit (backend), Puppeteer (E2E)

### Database Schema (Prisma)
Core business models:
- `companies` - Business entities with tax classification
- `transactions` - Financial records with classification
- `regex_rules` - Pattern matching rules for classification
- `transaction_cache` - Performance optimization cache
- External data collection tables for government/business data

### Critical Configuration
- **Environment**: `.env` files required for database URLs, API keys (especially for mshift-data_processing)
- **CORS**: Configured for frontend-backend communication
- **Redis**: TTL-based caching for classification layers
- **Testing**: Comprehensive test infrastructure with result logging
- **Ports**: 3000 (frontend), 8080 (backend), 8501 (data processing), 5432 (PostgreSQL), 6379 (Redis)

## Development Workflow

### TDD Approach (from Cursor rules)
This project follows strict Test-Driven Development:
1. Write failing tests first
2. Implement minimal code to pass
3. Refactor while maintaining test coverage
4. Each feature requires approval before proceeding

### File Structure Conventions
- **Components**: PascalCase (TransactionProcessing.tsx)
- **Services**: kebab-case (cache-service.ts)
- **API Routes**: kebab-case/route.ts
- **Tests**: [filename].test.ts

### Layer Processing Priority
1. **Cache lookup** first (Redis/PostgreSQL cache)
2. **Regex patterns** for known business types
3. **ML inference** for similarity matching (future)
4. **LLM processing** for complex/unknown cases only

## Important Patterns

### Transaction Classification
The system is optimized for Korean financial data with specific patterns for:
- Gas stations (주유소)
- Convenience stores (편의점) 
- Car service centers (카센터)
- Online services (온라인서비스)

### Error Handling
- Progressive fallback through classification layers
- Comprehensive logging to `test-results/` directory
- Health checks via Spring Actuator endpoints

### Performance Optimization
- Redis caching with configurable TTL
- Batch processing support for large datasets
- Database indexes on frequently queried fields

## Testing Strategy

### Test Levels
- **Unit Tests**: Individual service functions
- **Integration Tests**: API endpoint validation
- **E2E Tests**: Full pipeline processing via Puppeteer
- **Performance Tests**: Layer processing distribution validation

### Test Execution
Tests generate detailed logs in `test-results/`:
- `integrated-test-report.log` - Full system testing
- `test_summary.csv` - Results summary
- `rule-management-test.log` - Rule engine testing

When running tests, always check these logs for detailed failure analysis.

## Key Implementation Notes

### Lint and Type Checking
Always run after code changes:
```bash
cd mshift-admin && yarn lint    # Frontend linting
cd mshift-api && mvn test       # Backend validation
```

### Database Migrations
Use Prisma for schema changes:
1. Modify `prisma/schema.prisma`
2. Run `yarn db:generate`
3. Apply with `yarn db:push` or `yarn db:migrate`

### Business Logic
The core classification engine prioritizes:
1. Performance (cache hits)
2. Accuracy (regex patterns)
3. Coverage (ML + LLM fallbacks)

Business rules are centralized in the `regex_rules` table and cached in Redis for optimal performance.

## Mobile App Development

The project includes a React Native mobile app:

### Mobile App (mshift-app)
```bash
# 환경 설정 (최초 실행 시)
./setup-app.sh       # Clean setup with proper dependencies

# 일반 실행
./start-app.sh       # Start Expo development server
cd mshift-app && expo start --clear  # Alternative direct start

# 수동 설정 (필요시)
cd mshift-app
rm -rf node_modules yarn.lock
yarn install
expo start --clear
```

**Technology Stack**: React Native with Expo SDK 53, TypeScript, Redux Toolkit
**Key Features**: Account detail screens, data connection, settings management, D3.js network graph visualization
**Ports**: Expo Metro: 8081, Expo Dev Tools: 19002

**Important**: The mobile app uses its own package.json and dependencies separate from the monorepo root. Always run setup-app.sh when encountering dependency issues.