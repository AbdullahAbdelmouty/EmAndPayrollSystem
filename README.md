# Employee Management & Payroll System

A full-stack application for managing employees and calculating monthly payslips, built with **NestJS** (backend), **React + Vite** (frontend), **PostgreSQL** (database), and fully containerized with **Docker Compose**.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Running Without Docker](#running-without-docker)
- [API Documentation](#api-documentation)
- [Running Tests](#running-tests)
- [Architecture Overview](#architecture-overview)
- [Payroll Calculation & Rounding Rules](#payroll-calculation--rounding-rules)
- [Assumptions](#assumptions)
- [Known Limitations & Next Steps](#known-limitations--next-steps)
- [AI Usage](#ai-usage)

---

## Quick Start

> **Prerequisites:** Docker and Docker Compose installed.

```bash
# 1. Clone the repository and navigate to the project root
# 2. Copy the example environment file
cp .env.example .env

# 3. Start everything (database, backend, frontend)
docker compose up --build
```

| Service    | URL                          |
|------------|------------------------------|
| Frontend   | http://localhost:8080         |
| Backend API| http://localhost:3000/api/v1  |
| Swagger UI | http://localhost:3000/docs    |

The backend automatically runs TypeORM migrations and seeds sample employee data on first start (controlled by `SEED_ON_START=true` in `.env`).

---

## Running Without Docker

### Backend

```bash
cd backend
cp .env.example .env        # Configure DB connection
npm install
npm run migration:run       # Apply database migrations
npm run seed                # (Optional) Seed sample data
npm run start:dev           # Starts on port 3000
```

### Frontend

```bash
cd frontend
cp .env.example .env        # Set VITE_API_URL (defaults to http://localhost:3000/api)
npm install
npm run dev                 # Starts on port 5173
```

---

## API Documentation

Interactive Swagger / OpenAPI documentation is available at **`/docs`** when the backend is running (e.g., http://localhost:3000/docs).

### Key Endpoints

| Method | Endpoint                                  | Description                     |
|--------|-------------------------------------------|---------------------------------|
| GET    | `/api/v1/employees`                       | List employees (paginated, filterable) |
| POST   | `/api/v1/employees`                       | Create a new employee           |
| GET    | `/api/v1/employees/:id`                   | Get employee by ID              |
| PATCH  | `/api/v1/employees/:id`                   | Update an employee              |
| DELETE | `/api/v1/employees/:id`                   | Delete an employee              |
| GET    | `/api/v1/employees/:id/payslip?month=YYYY-MM` | Generate monthly payslip    |
| GET    | `/api/v1/health`                          | Health check                    |

All error responses follow **RFC 7807 Problem Details** format (`application/problem+json`).

---

## Running Tests

```bash
cd backend

# Unit tests (in-memory, no database required)
npm test

# Unit tests with coverage
npm run test:cov

# E2E / integration tests (requires a running database)
npm run test:e2e
```

Unit tests cover the core domain in isolation:
- **Payroll calculation** — progressive tax, social insurance, edge cases
- **Money value object** — arithmetic, rounding, overflow protection
- **Tax bracket validation** — malformed configs, boundary values
- **Social insurance deduction** — cap behavior, zero rate
- **Employee domain entity** — creation, validation rules, status transitions
- **Employee repository** — in-memory implementation contract tests
- **ORM mapper** — domain ↔ persistence mapping correctness
- **Problem Details filter** — error response formatting
- **Payroll service** — factory wiring, inactive-employee handling

---

## Architecture Overview

### Backend — Modular Clean Architecture

The backend uses a **Clean / Onion Architecture** organized into **feature modules** (`employees`, `payroll`). Each module is internally layered:

```
backend/src/
├── common/                     # Shared cross-cutting concerns
│   ├── errors/                 #   Domain error base classes
│   ├── filters/                #   Global exception filter (RFC 7807)
│   ├── pagination/             #   Paginated result type
│   ├── pipes/                  #   Validation pipe configuration
│   └── problem-details/        #   Problem Details type definitions
│
├── config/                     # Application & payroll configuration
│   ├── database.config.ts
│   ├── env.validation.ts
│   ├── payroll.config.ts
│   └── payroll-rules.json      # Tax brackets, insurance rate (configurable)
│
├── database/                   # Persistence infrastructure
│   ├── migrations/             #   TypeORM migrations
│   └── seeds/                  #   Seed data for development
│
├── employees/                  # Employee feature module
│   ├── domain/                 #   Entity, value objects, validation, repository interface
│   ├── application/            #   Service (use cases), DTOs
│   ├── infrastructure/         #   TypeORM repository, ORM entities, mapper
│   └── presentation/           #   REST controller
│
├── payroll/                    # Payroll feature module
│   ├── domain/                 #   PayrollCalculator, Money, TaxBracket, Deductions
│   ├── application/            #   PayrollService, factory, DTOs
│   ├── infrastructure/         #   (payroll reads employees via the employee repository)
│   └── presentation/           #   Payslip controller
│
└── health/                     # Health check module (@nestjs/terminus)
```

### Key Architectural Decisions

| Decision | Reasoning |
|----------|-----------|
| **Clean Architecture layers** | Business rules live in `domain/` with zero framework imports. The `PayrollCalculator`, `Money`, `Employee` entity, and all deduction classes are pure TypeScript — easy to test, easy to replace the framework or database. |
| **Repository pattern (interface + injection)** | `EmployeeRepository` is a domain interface; `TypeOrmEmployeeRepository` implements it. An `InMemoryEmployeeRepository` is provided for tests. Swapping the database requires only a new implementation. |
| **Dependency Injection via NestJS** | Modules wire concrete implementations to abstract tokens (`EMPLOYEE_REPOSITORY`). Controllers and services depend only on abstractions. |
| **Money as minor units (cents) with `bigint`** | Floating-point arithmetic is unsafe for money. All monetary values are stored and computed as integer minor units (cents). The `Money` value object uses `bigint` internally so intermediate products (salary × rate) can never overflow or lose precision. |
| **Rates as basis points (1/100th of a percent)** | Representing percentages as integers (e.g., 8% → 800 basis points) avoids decimal multiplication entirely. |
| **Deduction strategy pattern** | Each deduction type (`IncomeTaxDeduction`, `SocialInsuranceDeduction`) implements a `Deduction` interface. Adding a new deduction (e.g., pension, union dues) means adding a new class — no modification of existing code (Open/Closed Principle). |
| **Progressive tax calculated in a single rounding pass** | Per-bracket rounding accumulates error. Instead, the exact numerator across all brackets is summed first, then divided once with half-up rounding. |
| **Global exception filter (Problem Details)** | A single `ProblemDetailsFilter` catches all exceptions and maps them to RFC 7807 responses. No scattered `try/catch` blocks in controllers. |
| **Payroll rules as external configuration** | Tax brackets, social insurance rate, and cap are defined in `payroll-rules.json` and injected via NestJS config. Changing tax rules requires no code changes. |
| **TypeORM with migrations** | Schema changes are versioned and reproducible. `synchronize` is disabled in production. |
| **NestJS (Node.js + TypeScript)** | Mature, opinionated framework with first-class support for DI, validation, Swagger, and modular architecture — well-suited for enterprise-style APIs. |

### Frontend — Feature-Based React + TypeScript

```
frontend/src/
├── api/                        # HTTP client (Axios), API service functions
│   ├── httpClient.ts           #   Centralized Axios instance with error mapping
│   ├── employeesApi.ts         #   Employee CRUD API calls
│   ├── payrollApi.ts           #   Payslip API calls
│   └── problemDetails.ts       #   RFC 7807 error parsing
│
├── components/                 # Reusable UI components
│   ├── layout/                 #   App shell, navigation
│   ├── shared/                 #   Common components (combobox, etc.)
│   └── ui/                     #   Base UI primitives
│
├── features/                   # Feature modules
│   ├── employees/              #   Employee list, create/edit form, hooks, validation
│   └── payroll/                #   Payslip view, hooks, components
│
├── lib/                        # Utilities
├── App.tsx                     # Root component with routing
└── routes.tsx                  # Route definitions
```

| Decision | Reasoning |
|----------|-----------|
| **Vite** | Fastest dev server and build tool for React projects. |
| **Feature-based folder structure** | Each feature owns its pages, hooks, components, and types — scales well as the app grows. |
| **Axios with centralized error interceptor** | All API errors are parsed into RFC 7807 `ProblemDetails` objects before reaching components, ensuring consistent error display. |
| **Client-side validation mirrors server rules** | The frontend validates inputs before submission for a responsive UX, but the server is the source of truth — never trusting the client. |
| **TailwindCSS** | Utility-first CSS for rapid, consistent styling without writing custom CSS files for every component. |

---

## Payroll Calculation & Rounding Rules

### Formula

```
Gross  = Base Salary + Σ Allowances
Tax    = Progressive income tax on Gross
SI     = Social Insurance rate × min(Base Salary, Insurable Cap)
Net    = Gross − Tax − Social Insurance − Σ Other Deductions
```

### Rounding Rule

> **Half-up to the nearest minor unit (cent).**
>
> All intermediate calculations use `bigint` arithmetic (exact integers). Rounding happens **once** at the final division step (e.g., applying a percentage rate). The `divideRoundHalfUp` function rounds 0.5 away from zero:
> - `$10.005` → `$10.01`
> - `$10.004` → `$10.00`
>
> For progressive tax, rounding is applied **once on the total** (not per bracket), preventing accumulated rounding errors across brackets.

### Default Configuration (`payroll-rules.json`)

| Parameter                | Value        |
|--------------------------|--------------|
| Currency                 | USD          |
| Tax bracket 1            | 0% up to $10,000 (1,000,000 minor units) |
| Tax bracket 2            | 10% from $10,000 to $30,000              |
| Tax bracket 3            | 20% above $30,000                        |
| Social insurance rate    | 8%           |
| Insurable salary cap     | $40,000 (4,000,000 minor units)          |

These are **configurable** — edit `backend/src/config/payroll-rules.json` or provide overrides via environment variables.

---

## Assumptions

1. **Fictional tax regime.** The tax brackets and social insurance rules do not correspond to any real country's legislation. They are designed to demonstrate progressive taxation and configurable rules.

2. **Monthly payroll only.** The system calculates payslips on a monthly basis. Weekly, bi-weekly, or annual pay periods are not supported.

3. **Single currency.** All monetary amounts are in a single currency (USD by default). Multi-currency is out of scope.

4. **Money in minor units (cents).** All monetary values in the API and database are represented as integers in the smallest currency unit (e.g., `500000` = $5,000.00). This avoids floating-point precision issues entirely.

5. **Allowances and deductions are fixed monthly amounts.** They are stored per employee and applied as-is each month. Percentage-based allowances are not supported.

6. **Payslips are calculated on-the-fly**, not persisted. Each `GET /employees/:id/payslip` request recalculates from current data. A production system would likely persist historical payslips.

7. **Inactive employees cannot generate payslips.** Requesting a payslip for an inactive employee returns a `422 Unprocessable Entity` error.

8. **Email uniqueness is enforced** at both the domain and database level.

9. **No authentication or authorization** is implemented in this version (Task 5 is optional). All endpoints are publicly accessible.

10. **Hire date validation** uses calendar-day precision. An employee can be hired "today" but not "tomorrow."

---

## Known Limitations & Next Steps

### Current Limitations

- **No authentication/authorization.** All endpoints are open. In production, JWT or SSO (Task 5) would gate access based on roles (HR vs. Employee).
- **No payslip persistence.** Payslips are computed on every request. Historical records, PDF export, and audit trails are not supported.
- **No frontend tests.** Unit and integration tests cover only the backend. With more time, component tests (React Testing Library / Vitest) and E2E tests (Playwright) would be added.
- **No CD (continuous deployment).** The CI pipeline covers lint → test → build, but there is no automated deployment step yet.
- **No structured logging.** The application uses NestJS's default logger. A structured logging library (e.g., `pino`) with correlation IDs would improve observability.
- **No rate limiting or throttling.** The API has no protection against abuse.
- **Allowances/deductions are not date-scoped.** They apply to every month equally. A production system would support effective date ranges.

### What I Would Do Next

1. **Authentication & RBAC** — Integrate JWT-based auth with role guards (HR Admin, Employee). Enforce row-level security so employees can only view their own payslips.
2. **Payslip history** — Persist generated payslips with a `generated_at` timestamp. Add endpoints for listing historical payslips and exporting to PDF.
3. **Frontend testing** — Add Vitest unit tests for validation logic and React Testing Library tests for key components (employee form, payslip view).
4. **CI pipeline** — GitHub Actions: lint → unit tests → build Docker images → push to registry.
5. **Structured logging** — Replace default logger with Pino; add request correlation IDs.
6. **Percentage-based allowances** — Extend the allowance model to support percentage-of-base in addition to fixed amounts.
7. **Date-scoped pay items** — Allow allowances and deductions to have effective start/end dates so payslips for different months reflect historical changes.
8. **Audit trail** — Track who changed what and when for compliance.
9. **Leave & attendance modules** — Extend the modular architecture with new feature modules.

---

## AI Usage

AI tools were used during development. Full details are documented in the [`/ai-usage`](./ai-usage/) folder.

| Tool | Used For |
|------|----------|
| **Claude Chat** | Initial file structure planning, backend architecture, and boilerplate generation |
| **Codex** | Frontend component development and inline code suggestions |

All AI-generated code was reviewed, understood, and adapted to meet the project's requirements. See [`ai-usage/README.md`](./ai-usage/README.md) for the full transparency statement.