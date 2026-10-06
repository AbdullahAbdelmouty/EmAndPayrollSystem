#!/usr/bin/env bash
# Creates the folder/file skeleton for the Employee & Payroll assessment.
# Run from the repo root AFTER scaffolding (see the steps in chat):
#   nest new backend ...   and   npm create vite@latest frontend ...
# Existing files are never overwritten (touch only creates missing files).
set -euo pipefail

mk() {
  for f in "$@"; do
    mkdir -p "$(dirname "$f")"
    touch "$f"
  done
}

# ---------- Root ----------
mk README.md .gitignore .env.example docker-compose.yml \
   .github/workflows/ci.yml \
   ai-usage/README.md ai-usage/skills-and-tooling.md

# ---------- Backend (NestJS + TypeORM + PostgreSQL) ----------
B=backend
mk $B/.env.example $B/Dockerfile $B/.dockerignore

# main + config
mk $B/src/config/app.config.ts \
   $B/src/config/database.config.ts \
   $B/src/config/payroll.config.ts \
   $B/src/config/env.validation.ts \
   $B/src/config/payroll-rules.json

# cross-cutting
mk $B/src/common/problem-details/problem-details.interface.ts \
   $B/src/common/filters/problem-details.filter.ts \
   $B/src/common/filters/problem-details.filter.spec.ts \
   $B/src/common/errors/domain.error.ts \
   $B/src/common/pagination/paginated-result.ts \
   $B/src/common/pagination/pagination.query.ts \
   $B/src/common/logging/logger.module.ts

# health
mk $B/src/health/health.controller.ts $B/src/health/health.module.ts

# database (migrations + seed)
mk $B/src/database/data-source.ts \
   $B/src/database/migrations/.gitkeep \
   $B/src/database/seeds/seed.ts \
   $B/src/database/seeds/employees.seed-data.ts

# employees module (domain / application / infrastructure / presentation)
E=$B/src/employees
mk $E/employees.module.ts \
   $E/domain/employee.ts \
   $E/domain/employee.spec.ts \
   $E/domain/employee-status.enum.ts \
   $E/domain/employee.repository.ts \
   $E/domain/errors/employee-not-found.error.ts \
   $E/domain/errors/duplicate-email.error.ts \
   $E/application/employees.service.ts \
   $E/application/employees.service.spec.ts \
   $E/application/dto/create-employee.dto.ts \
   $E/application/dto/update-employee.dto.ts \
   $E/application/dto/list-employees.query.ts \
   $E/application/dto/employee.response.ts \
   $E/infrastructure/employee.orm-entity.ts \
   $E/infrastructure/typeorm-employee.repository.ts \
   $E/infrastructure/employee.mapper.ts \
   $E/infrastructure/in-memory-employee.repository.ts \
   $E/presentation/employees.controller.ts

# payroll module (pure domain core, framework-free)
P=$B/src/payroll
mk $P/payroll.module.ts \
   $P/domain/money.ts \
   $P/domain/money.spec.ts \
   $P/domain/rounding.ts \
   $P/domain/tax-bracket.ts \
   $P/domain/payslip.ts \
   $P/domain/payroll-calculator.ts \
   $P/domain/payroll-calculator.spec.ts \
   $P/domain/deductions/deduction.ts \
   $P/domain/deductions/income-tax.deduction.ts \
   $P/domain/deductions/income-tax.deduction.spec.ts \
   $P/domain/deductions/social-insurance.deduction.ts \
   $P/domain/deductions/social-insurance.deduction.spec.ts \
   $P/domain/errors/inactive-employee.error.ts \
   $P/application/payroll.service.ts \
   $P/application/payroll.service.spec.ts \
   $P/application/dto/payslip.response.ts \
   $P/application/dto/payslip.query.ts \
   $P/application/payroll-config.provider.ts \
   $P/infrastructure/json-payroll-config.provider.ts \
   $P/presentation/payroll.controller.ts

# app root + e2e
mk $B/src/app.module.ts $B/src/main.ts \
   $B/test/employees.e2e-spec.ts \
   $B/test/payslip.e2e-spec.ts \
   $B/test/jest-e2e.json

# ---------- Frontend (React + Vite + TypeScript + SCSS) ----------
F=frontend/src
mk frontend/.env.example frontend/Dockerfile frontend/.dockerignore

# app shell
mk $F/main.tsx $F/App.tsx $F/routes.tsx

# API layer (no React here)
mk $F/api/httpClient.ts \
   $F/api/employeesApi.ts \
   $F/api/payrollApi.ts \
   $F/api/problemDetails.ts

# employees feature
EF=$F/features/employees
mk $EF/types.ts \
   $EF/validation/employeeValidation.ts \
   $EF/validation/employeeValidation.test.ts \
   $EF/hooks/useEmployees.ts \
   $EF/hooks/useEmployeeMutations.ts \
   $EF/hooks/useEmployeeForm.ts \
   $EF/components/EmployeeTable.tsx \
   $EF/components/EmployeeForm.tsx \
   $EF/components/EmployeeFilters.tsx \
   $EF/components/Pagination.tsx \
   $EF/components/DeleteConfirmDialog.tsx \
   $EF/pages/EmployeeListPage.tsx \
   $EF/pages/EmployeeFormPage.tsx

# payroll feature
PF=$F/features/payroll
mk $PF/types.ts \
   $PF/hooks/usePayslip.ts \
   $PF/components/MonthPicker.tsx \
   $PF/components/PayslipBreakdown.tsx \
   $PF/pages/PayslipPage.tsx

# shared UI + utils
mk $F/shared/components/ErrorBanner.tsx \
   $F/shared/components/FormField.tsx \
   $F/shared/components/Spinner.tsx \
   $F/shared/utils/formatMoney.ts \
   $F/shared/utils/formatMoney.test.ts

# styles (hand-written SCSS)
mk $F/styles/_variables.scss \
   $F/styles/_mixins.scss \
   $F/styles/main.scss \
   $F/styles/components/_table.scss \
   $F/styles/components/_form.scss \
   $F/styles/components/_payslip.scss \
   $F/styles/components/_dialog.scss

echo "Structure created."