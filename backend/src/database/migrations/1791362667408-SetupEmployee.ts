import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetupEmployee1791362667408 implements MigrationInterface {
  name = 'SetupEmployee1791362667408';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "employee_allowances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "type" character varying(50) NOT NULL, "amount_minor" bigint NOT NULL, CONSTRAINT "uq_allowance_employee_type" UNIQUE ("employee_id", "type"), CONSTRAINT "ck_allowance_amount" CHECK ("amount_minor" >= 0), CONSTRAINT "PK_6bdb38fe7c132752ef36fddba0f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "employee_deductions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "type" character varying(50) NOT NULL, "amount_minor" bigint NOT NULL, CONSTRAINT "uq_deduction_employee_type" UNIQUE ("employee_id", "type"), CONSTRAINT "ck_deduction_amount" CHECK ("amount_minor" >= 0), CONSTRAINT "PK_fbdf302204dc12579b88b67dadf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "employees" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "full_name" character varying(100) NOT NULL, "email" character varying(254) NOT NULL, "job_title" character varying(100) NOT NULL, "department" character varying(100) NOT NULL, "hire_date" date NOT NULL, "base_salary_minor" bigint NOT NULL, "status" character varying(10) NOT NULL DEFAULT 'ACTIVE', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_765bc1ac8967533a04c74a9f6af" UNIQUE ("email"), CONSTRAINT "ck_employees_status" CHECK ("status" IN ('ACTIVE', 'INACTIVE')), CONSTRAINT "ck_employees_salary_positive" CHECK ("base_salary_minor" > 0), CONSTRAINT "PK_b9535a98350d5b26e7eb0c26af4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_employees_department" ON "employees" ("department") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_employees_status" ON "employees" ("status") `,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_allowances" ADD CONSTRAINT "FK_016cc2f3c0c43fb9a98e638d7ca" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_deductions" ADD CONSTRAINT "FK_7ea5887bfe829965698f1f5b3ca" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee_deductions" DROP CONSTRAINT "FK_7ea5887bfe829965698f1f5b3ca"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_allowances" DROP CONSTRAINT "FK_016cc2f3c0c43fb9a98e638d7ca"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_employees_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_employees_department"`);
    await queryRunner.query(`DROP TABLE "employees"`);
    await queryRunner.query(`DROP TABLE "employee_deductions"`);
    await queryRunner.query(`DROP TABLE "employee_allowances"`);
  }
}
