import { In } from 'typeorm';
import dataSource from '../data-source';
import { EmployeeAllowanceOrmEntity } from '../../employees/infrastructure/employee-allowances.orm-entity';
import { EmployeeDeductionOrmEntity } from '../../employees/infrastructure/employee-deductions.orm-entity';
import { EmployeeOrmEntity } from '../../employees/infrastructure/employee.orm-entity';
import { demoEmployees } from './employees.seed-data';

const DEMO_PAYROLL_MONTH = '2026-10';

async function seed(): Promise<void> {
  await dataSource.initialize();

  try {
    const insertedCount = await dataSource.transaction(async (manager) => {
      const employeeRepository = manager.getRepository(EmployeeOrmEntity);
      const allowanceRepository = manager.getRepository(
        EmployeeAllowanceOrmEntity,
      );
      const deductionRepository = manager.getRepository(
        EmployeeDeductionOrmEntity,
      );
      const emails = demoEmployees.map((employee) => employee.email);
      const existingEmployees = await employeeRepository.find({
        select: { email: true },
        where: { email: In(emails) },
      });
      const existingEmails = new Set(
        existingEmployees.map((employee) => employee.email),
      );
      const employeesToInsert = demoEmployees.filter(
        (employee) => !existingEmails.has(employee.email),
      );

      for (const employee of employeesToInsert) {
        const savedEmployee = await employeeRepository.save(
          employeeRepository.create({
            fullName: employee.fullName,
            email: employee.email,
            jobTitle: employee.jobTitle,
            department: employee.department,
            hireDate: employee.hireDate,
            baseSalaryMinor: employee.baseSalaryMinor,
            status: employee.status,
          }),
        );

        if (employee.allowances.length > 0) {
          await allowanceRepository.save(
            employee.allowances.map((allowance) =>
              allowanceRepository.create({
                employeeId: savedEmployee.id,
                month: DEMO_PAYROLL_MONTH,
                ...allowance,
              }),
            ),
          );
        }

        if (employee.deductions.length > 0) {
          await deductionRepository.save(
            employee.deductions.map((deduction) =>
              deductionRepository.create({
                employeeId: savedEmployee.id,
                month: DEMO_PAYROLL_MONTH,
                ...deduction,
              }),
            ),
          );
        }
      }

      return employeesToInsert.length;
    });

    console.info(`Seeded ${insertedCount} demo employee(s).`);
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((error: unknown) => {
  console.error('Failed to seed demo data.', error);
  process.exitCode = 1;
});
