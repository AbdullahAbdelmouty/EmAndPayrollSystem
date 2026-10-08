import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { bigintTransformer } from '../../common/database/bigint.transformer';
import { EmployeeAllowanceOrmEntity } from './employee-allowances.orm-entity';
import { EmployeeDeductionOrmEntity } from './employee-deductions.orm-entity';

@Entity('employees')
@Check('ck_employees_salary_positive', '"base_salary_minor" > 0')
@Check('ck_employees_status', `"status" IN ('ACTIVE', 'INACTIVE')`)
export class EmployeeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 100 })
  fullName!: string;

  @Column({ type: 'varchar', length: 254, unique: true })
  email!: string;

  @Column({ name: 'job_title', type: 'varchar', length: 100 })
  jobTitle!: string;

  @Index('idx_employees_department')
  @Column({ type: 'varchar', length: 100 })
  department!: string;

  @Column({ name: 'hire_date', type: 'date' })
  hireDate!: string;

  @Column({
    name: 'base_salary_minor',
    type: 'bigint',
    transformer: bigintTransformer,
  })
  baseSalaryMinor!: number;

  @Index('idx_employees_status')
  @Column({ type: 'varchar', length: 10, default: 'ACTIVE' })
  status!: 'ACTIVE' | 'INACTIVE';

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(
    () => EmployeeAllowanceOrmEntity,
    (allowance) => allowance.employee,
    { cascade: true },
  )
  allowances!: EmployeeAllowanceOrmEntity[];

  @OneToMany(
    () => EmployeeDeductionOrmEntity,
    (deduction) => deduction.employee,
    { cascade: true },
  )
  deductions!: EmployeeDeductionOrmEntity[];
}
