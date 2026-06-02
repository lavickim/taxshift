# TaxShift (MoneyShift)

TaxShift is an open-source transaction normalization and bookkeeping automation
project for Korean bank and card transaction data. The codebase is currently
organized under the internal MoneyShift module name (`mshift-*`) and combines a
Spring Boot API, a Next.js admin console, PostgreSQL, Redis, and rule-based
classification tools.

The project focuses on turning noisy transaction strings into structured data
that can support bookkeeping, account mapping, journal entries, ledgers,
month-end closing workflows, and operator review.

## Why This Project Exists

Korean financial transaction descriptions are often short, inconsistent, and
merchant-specific. A bookkeeping system needs to normalize those strings before
it can reliably classify spending, map transactions to accounts, or prepare
journal entries.

TaxShift explores a practical workflow for that problem:

- preprocess transaction text with curated regular-expression rules
- map normalized keywords and tags to accounting categories
- maintain chart-of-accounts and journal-entry workflows
- expose admin tools for rule editing, testing, and review
- cache active rules for faster matching
- keep test data and rule-design documents available for maintainers

## Main Components

```text
.
+-- mshift-api/       # Spring Boot API and accounting/rule services
+-- mshift-admin/     # Next.js admin console
+-- mshift-manager/   # Desktop/manager shell experiments
+-- scripts/          # Database, backup, setup, and test scripts
+-- data/             # Rule and application data
+-- project-design/   # Design notes, accounting docs, and rule-engine plans
`-- _deprecated/      # Archived prototypes and older experiments
```

## Core Capabilities

- Rule-based transaction text normalization
- Regex preprocessing rule management
- Keyword extraction, grouping, and mapping
- Tag-to-account mapping
- Chart of accounts expansion
- Transaction-to-journal-entry workflows
- General ledger and month-end closing support
- Voucher template and voucher generation services
- Redis-backed rule caching
- PostgreSQL persistence through MyBatis and Prisma-backed admin tooling
- Next.js admin pages for data analysis, LLM workflows, and rule operations

## Architecture

```text
Next.js Admin Console
        |
        v
Spring Boot API
        |
        +--> PostgreSQL
        |
        +--> Redis
```

Default local ports:

- Admin console: `http://localhost:3000`
- API server: `http://localhost:8080`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## Technology Stack

Backend:

- Java 17
- Spring Boot 3.2.7
- MyBatis 3.0.3
- PostgreSQL 15
- Redis 7
- Maven
- SpringDoc OpenAPI
- SpotBugs

Frontend/admin:

- Next.js
- TypeScript
- React
- Tailwind CSS
- Prisma
- Jest
- Radix UI components

Testing and tooling:

- JUnit and Spring Boot tests
- Jest admin tests
- Puppeteer scripts
- Docker Compose for PostgreSQL and Redis

## Quick Start

Requirements:

- Java 17 or later
- Node.js 18 or later
- Yarn or npm
- Maven 3.8 or later
- Docker and Docker Compose

Clone the repository:

```bash
git clone https://github.com/lavickim/taxshift.git
cd taxshift
```

Start PostgreSQL and Redis:

```bash
./start-db.sh
```

Start the Spring Boot API:

```bash
./start-backend.sh
```

Start the Next.js admin console:

```bash
./start-admin.sh
```

To start the coordinated local stack:

```bash
./start-all.sh
```

Note: `start-all.sh` starts the database, backend, and admin console, then asks
whether to start the mobile app flow. Use the individual scripts above when you
want tighter control.

## Environment

Copy the example environment file when needed:

```bash
cp .env.example .env
```

The default development settings use:

```text
DB_HOST=localhost
DB_PORT=5432
DB_NAME=moneyshift
DB_USER=postgres
DB_PASSWORD=postgres
REDIS_HOST=localhost
REDIS_PORT=6379
API_BASE_URL=http://localhost:8080/api
```

The admin app may also need local environment values inside `mshift-admin/`,
depending on which workflow you run.

## Backend Development

Run the API from the backend directory:

```bash
cd mshift-api
mvn spring-boot:run
```

Run backend tests:

```bash
cd mshift-api
mvn test
```

The backend exposes controllers for rule matching, regex preprocessing,
transactions, chart of accounts, journal entries, general ledger, voucher
generation, keyword systems, and related accounting workflows.

## Admin Development

Install dependencies and run the admin console:

```bash
cd mshift-admin
yarn install
yarn db:generate
yarn dev
```

Run admin tests:

```bash
cd mshift-admin
yarn test
```

Build the admin app:

```bash
cd mshift-admin
yarn build
```

## Useful Scripts

```bash
./start-db.sh                    # Start PostgreSQL and Redis
./start-backend.sh               # Run backend checks, then start the API
./start-backend-no-tdd.sh        # Start the API without the TDD startup gate
./start-admin.sh                 # Start the Next.js admin console
./start-all.sh                   # Start the coordinated local stack
./stop-all.sh                    # Stop local services
./scripts/test-integrated.sh     # Run integrated service checks
./scripts/test-rule-management.sh
./scripts/backup-database.sh
```

## API Examples

Rule matching:

```http
POST /api/rule-engine/match
Content-Type: application/json

{
  "inputText": "GS25 card payment",
  "category": "convenience_store",
  "returnAllMatches": true
}
```

Admin rule creation:

```http
POST /api/admin/rules
Content-Type: application/json

{
  "pattern": "(GS25|CU|7-ELEVEN)",
  "description": "Convenience store transaction",
  "category": "convenience_store",
  "enabled": true,
  "priority": 50,
  "confidence": 0.8
}
```

## Maintenance Notes

This repository includes active modules and older prototypes. Treat
`mshift-api`, `mshift-admin`, `scripts`, `data`, and `project-design` as the
main project areas. Content under `_deprecated` is kept for historical context
and should not be used as the source of truth for new work.

Because the project touches financial transaction parsing and accounting
automation, maintainers should review changes with extra care around:

- rule-matching false positives
- account mapping correctness
- journal-entry generation
- data import/export behavior
- authentication and admin-only paths
- secrets in environment files or logs
- generated test data and sample financial records

## Contributing

Issues and pull requests are welcome. Useful contributions include:

- new transaction normalization rules
- safer rule-matching tests
- accounting workflow fixes
- admin UX improvements
- documentation cleanup
- security review and static-analysis improvements

When contributing, prefer small focused pull requests and include the relevant
test command or manual verification notes.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
