import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMonthToEmployeePayItems1791450000000
  implements MigrationInterface
{
  name = 'AddMonthToEmployeePayItems1791450000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee_allowances" ADD "month" character varying(7) NOT NULL DEFAULT to_char(CURRENT_DATE, 'YYYY-MM')`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_deductions" ADD "month" character varying(7) NOT NULL DEFAULT to_char(CURRENT_DATE, 'YYYY-MM')`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_allowances" DROP CONSTRAINT "uq_allowance_employee_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_deductions" DROP CONSTRAINT "uq_deduction_employee_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_allowances" ADD CONSTRAINT "uq_allowance_employee_month_type" UNIQUE ("employee_id", "month", "type")`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_deductions" ADD CONSTRAINT "uq_deduction_employee_month_type" UNIQUE ("employee_id", "month", "type")`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_allowances" ADD CONSTRAINT "ck_allowance_month" CHECK ("month" ~ '^\\d{4}-(0[1-9]|1[0-2])$')`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_deductions" ADD CONSTRAINT "ck_deduction_month" CHECK ("month" ~ '^\\d{4}-(0[1-9]|1[0-2])$')`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_allowances" ALTER COLUMN "month" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_deductions" ALTER COLUMN "month" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee_deductions" DROP CONSTRAINT "ck_deduction_month"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_allowances" DROP CONSTRAINT "ck_allowance_month"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_deductions" DROP CONSTRAINT "uq_deduction_employee_month_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_allowances" DROP CONSTRAINT "uq_allowance_employee_month_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_deductions" ADD CONSTRAINT "uq_deduction_employee_type" UNIQUE ("employee_id", "type")`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_allowances" ADD CONSTRAINT "uq_allowance_employee_type" UNIQUE ("employee_id", "type")`,
    );
    await queryRunner.query(`ALTER TABLE "employee_deductions" DROP COLUMN "month"`);
    await queryRunner.query(`ALTER TABLE "employee_allowances" DROP COLUMN "month"`);
  }
}
