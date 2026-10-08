import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { bigintTransformer } from '../../common/database/bigint.transformer';
import { EmployeeOrmEntity } from './employee.orm-entity';

@Entity('employee_allowances')
@Unique('uq_allowance_employee_month_type', ['employeeId', 'month', 'type'])
@Check('ck_allowance_amount', '"amount_minor" >= 0')
export class EmployeeAllowanceOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId!: string;

  @ManyToOne(() => EmployeeOrmEntity, (employee) => employee.allowances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employee_id' })
  employee!: EmployeeOrmEntity;

  @Column({ type: 'varchar', length: 50 })
  type!: string;

  @Column({ type: 'varchar', length: 7 })
  month!: string;

  @Column({
    name: 'amount_minor',
    type: 'bigint',
    transformer: bigintTransformer,
  })
  amountMinor!: number;
}
