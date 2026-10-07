import { FieldError } from '../../common/problem-details/problem-details.interface';
import { EmployeeDetails, PayItem } from './employee-details';

export const FULL_NAME_MAX_LENGTH = 100;
export const EMAIL_MAX_LENGTH = 254;

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

export function validateEmployeeDetails(
  details: EmployeeDetails,
  today: Date,
): FieldError[] {
  return [
    ...validateFullName(details.fullName),
    ...validateEmail(details.email),
    ...validateRequired('jobTitle', 'Job title', details.jobTitle),
    ...validateRequired('department', 'Department', details.department),
    ...validateHireDate(details.hireDate, today),
    ...validateBaseSalary(details.baseSalaryMinor),
    ...validatePayItems('allowances', details.allowances),
    ...validatePayItems('deductions', details.deductions),
  ];
}

function validateFullName(fullName: string): FieldError[] {
  if (fullName.length === 0)
    return [fieldError('fullName', 'Full name is required.')];
  if (fullName.length > FULL_NAME_MAX_LENGTH) {
    return [
      fieldError(
        'fullName',
        `Full name must be at most ${FULL_NAME_MAX_LENGTH} characters.`,
      ),
    ];
  }
  return [];
}

function validateEmail(email: string): FieldError[] {
  if (email.length === 0) return [fieldError('email', 'Email is required.')];
  if (email.length > EMAIL_MAX_LENGTH || !EMAIL_FORMAT.test(email)) {
    return [fieldError('email', 'Email must be a valid email address.')];
  }
  return [];
}

function validateRequired(
  field: string,
  label: string,
  value: string,
): FieldError[] {
  return value.length === 0 ? [fieldError(field, `${label} is required.`)] : [];
}

function validateHireDate(hireDate: string, today: Date): FieldError[] {
  if (hireDate.length === 0)
    return [fieldError('hireDate', 'Hire date is required.')];
  if (!isRealCalendarDate(hireDate)) {
    return [
      fieldError('hireDate', 'Hire date must be a valid date (YYYY-MM-DD).'),
    ];
  }
  if (hireDate > toUtcDateString(today)) {
    return [fieldError('hireDate', 'Hire date cannot be in the future.')];
  }
  return [];
}

function validateBaseSalary(baseSalaryMinor: number): FieldError[] {
  if (!Number.isSafeInteger(baseSalaryMinor)) {
    return [
      fieldError(
        'baseSalaryMinor',
        'Base salary must be a whole number of minor units.',
      ),
    ];
  }
  if (baseSalaryMinor <= 0) {
    return [
      fieldError('baseSalaryMinor', 'Base salary must be greater than 0.'),
    ];
  }
  return [];
}

function validatePayItems(
  field: 'allowances' | 'deductions',
  items: PayItem[],
): FieldError[] {
  const errors: FieldError[] = [];
  const seenTypes = new Set<string>();

  items.forEach((item, index) => {
    const path = `${field}[${index}]`;
    if (item.type.length === 0)
      errors.push(fieldError(`${path}.type`, 'Type is required.'));
    if (seenTypes.has(item.type))
      errors.push(fieldError(`${path}.type`, `Duplicate type ${item.type}.`));
    seenTypes.add(item.type);
    if (!Number.isSafeInteger(item.amountMinor) || item.amountMinor < 0) {
      errors.push(
        fieldError(
          `${path}.amountMinor`,
          'Amount must be a whole number of minor units, 0 or more.',
        ),
      );
    }
  });
  return errors;
}

function isRealCalendarDate(value: string): boolean {
  if (!ISO_DATE_FORMAT.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && toUtcDateString(parsed) === value;
}

function toUtcDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function fieldError(field: string, message: string): FieldError {
  return { field, message };
}
