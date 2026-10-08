import { DomainValidationError } from '../../common/errors/domain.error';
import { Employee, NewEmployee } from './employee';
import { EmployeeStatus } from './employee-status.enum';

const today = new Date('2026-10-07T12:00:00Z');

const validInput = (overrides: Partial<NewEmployee> = {}): NewEmployee => ({
  id: '7d0e6c1a-0000-4000-8000-000000000001',
  fullName: 'Ana Silva',
  email: 'ana.silva@acme.com',
  jobTitle: 'Backend Engineer',
  department: 'Engineering',
  hireDate: '2024-03-01',
  baseSalaryMinor: 500_000,
  ...overrides,
});

const fieldsRejectedBy = (input: NewEmployee): string[] => {
  try {
    Employee.create(input, today);
  } catch (error) {
    if (error instanceof DomainValidationError)
      return error.errors.map((e) => e.field);
    throw error;
  }
  return [];
};

describe('Employee.create', () => {
  it('creates an active employee from valid input', () => {
    const employee = Employee.create(validInput(), today);

    expect(employee.fullName).toBe('Ana Silva');
    expect(employee.status).toBe(EmployeeStatus.Active);
    expect(employee.isActive()).toBe(true);
    expect(employee.allowances).toEqual([]);
    expect(employee.deductions).toEqual([]);
  });

  it('trims text fields and lowercases the email', () => {
    const employee = Employee.create(
      validInput({
        fullName: '  Ana Silva ',
        email: '  Ana.Silva@ACME.com ',
        department: ' Engineering ',
      }),
      today,
    );

    expect(employee.fullName).toBe('Ana Silva');
    expect(employee.email).toBe('ana.silva@acme.com');
    expect(employee.department).toBe('Engineering');
  });

  describe('full name', () => {
    it('rejects an empty name', () => {
      expect(fieldsRejectedBy(validInput({ fullName: '' }))).toEqual([
        'fullName',
      ]);
    });

    it('rejects a name that is only whitespace', () => {
      expect(fieldsRejectedBy(validInput({ fullName: '    ' }))).toEqual([
        'fullName',
      ]);
    });

    it('accepts exactly 100 characters', () => {
      expect(
        fieldsRejectedBy(validInput({ fullName: 'a'.repeat(100) })),
      ).toEqual([]);
    });

    it('rejects 101 characters', () => {
      expect(
        fieldsRejectedBy(validInput({ fullName: 'a'.repeat(101) })),
      ).toEqual(['fullName']);
    });
  });

  describe('email', () => {
    it('rejects an empty email', () => {
      expect(fieldsRejectedBy(validInput({ email: '' }))).toEqual(['email']);
    });

    for (const email of [
      'plainaddress',
      'missing@tld',
      '@no-local.com',
      'two@@at.com',
      'space in@mail.com',
    ]) {
      it(`rejects the malformed email "${email}"`, () => {
        expect(fieldsRejectedBy(validInput({ email }))).toEqual(['email']);
      });
    }

    it('rejects an email longer than 254 characters', () => {
      const email = `${'a'.repeat(250)}@x.co`;
      expect(fieldsRejectedBy(validInput({ email }))).toEqual(['email']);
    });
  });

  describe('job title and department', () => {
    it('rejects a missing job title', () => {
      expect(fieldsRejectedBy(validInput({ jobTitle: ' ' }))).toEqual([
        'jobTitle',
      ]);
    });

    it('rejects a missing department', () => {
      expect(fieldsRejectedBy(validInput({ department: '' }))).toEqual([
        'department',
      ]);
    });
  });

  describe('hire date', () => {
    it('accepts today', () => {
      expect(fieldsRejectedBy(validInput({ hireDate: '2026-10-07' }))).toEqual(
        [],
      );
    });

    it('rejects tomorrow', () => {
      expect(fieldsRejectedBy(validInput({ hireDate: '2026-10-08' }))).toEqual([
        'hireDate',
      ]);
    });

    it('rejects a date far in the future', () => {
      expect(fieldsRejectedBy(validInput({ hireDate: '2099-01-01' }))).toEqual([
        'hireDate',
      ]);
    });

    for (const hireDate of [
      '',
      '07/10/2026',
      '2026-1-5',
      '2026-02-30',
      'not-a-date',
    ]) {
      it(`rejects the invalid date "${hireDate}"`, () => {
        expect(fieldsRejectedBy(validInput({ hireDate }))).toEqual([
          'hireDate',
        ]);
      });
    }
  });

  describe('base salary', () => {
    for (const baseSalaryMinor of [0, -1, -500_000]) {
      it(`rejects ${baseSalaryMinor}`, () => {
        expect(fieldsRejectedBy(validInput({ baseSalaryMinor }))).toEqual([
          'baseSalaryMinor',
        ]);
      });
    }

    for (const baseSalaryMinor of [1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      it(`rejects the non-integer ${baseSalaryMinor}`, () => {
        expect(fieldsRejectedBy(validInput({ baseSalaryMinor }))).toEqual([
          'baseSalaryMinor',
        ]);
      });
    }

    it('accepts the smallest valid salary, 1 minor unit', () => {
      expect(fieldsRejectedBy(validInput({ baseSalaryMinor: 1 }))).toEqual([]);
    });
  });

  describe('allowances and deductions', () => {
    it('normalizes the type to upper case', () => {
      const employee = Employee.create(
        validInput({
          allowances: [
            { type: ' transport ', month: ' 2026-03 ', amountMinor: 5_000 },
          ],
        }),
        today,
      );

      expect(employee.allowances).toEqual([
        { type: 'TRANSPORT', month: '2026-03', amountMinor: 5_000 },
      ]);
    });

    it('accepts a zero amount', () => {
      expect(
        fieldsRejectedBy(
          validInput({
            allowances: [{ type: 'HOUSING', month: '2026-03', amountMinor: 0 }],
          }),
        ),
      ).toEqual([]);
    });

    it('rejects a negative amount', () => {
      const input = validInput({
        deductions: [{ type: 'LOAN', month: '2026-03', amountMinor: -1 }],
      });
      expect(fieldsRejectedBy(input)).toEqual(['deductions[0].amountMinor']);
    });

    it('rejects a blank type', () => {
      const input = validInput({
        allowances: [{ type: '  ', month: '2026-03', amountMinor: 100 }],
      });
      expect(fieldsRejectedBy(input)).toEqual(['allowances[0].type']);
    });

    it('rejects duplicate types after normalization', () => {
      const input = validInput({
        allowances: [
          { type: 'transport', month: '2026-03', amountMinor: 100 },
          { type: 'TRANSPORT', month: '2026-03', amountMinor: 200 },
        ],
      });
      expect(fieldsRejectedBy(input)).toEqual(['allowances[1].type']);
    });
  });

  it('reports every violated rule at once', () => {
    const input = validInput({
      fullName: '',
      email: 'bad',
      hireDate: '2099-01-01',
      baseSalaryMinor: 0,
    });

    expect(fieldsRejectedBy(input)).toEqual([
      'fullName',
      'email',
      'hireDate',
      'baseSalaryMinor',
    ]);
  });
});

describe('Employee.update', () => {
  it('returns a new employee with the changes and leaves the original untouched', () => {
    const original = Employee.create(validInput(), today);

    const updated = original.update(
      { jobTitle: 'Tech Lead', baseSalaryMinor: 650_000 },
      today,
    );

    expect(updated.jobTitle).toBe('Tech Lead');
    expect(updated.baseSalaryMinor).toBe(650_000);
    expect(updated.id).toBe(original.id);
    expect(original.jobTitle).toBe('Backend Engineer');
  });

  it('ignores fields that are undefined', () => {
    const original = Employee.create(validInput(), today);

    expect(original.update({ department: undefined }, today).department).toBe(
      'Engineering',
    );
  });

  it('re-validates the result', () => {
    const original = Employee.create(validInput(), today);

    expect(() => original.update({ baseSalaryMinor: -5 }, today)).toThrow(
      DomainValidationError,
    );
  });
});

describe('Employee status', () => {
  it('deactivates and reactivates without mutating the original', () => {
    const active = Employee.create(validInput(), today);

    const inactive = active.deactivate();

    expect(inactive.isActive()).toBe(false);
    expect(inactive.status).toBe(EmployeeStatus.Inactive);
    expect(active.isActive()).toBe(true);
    expect(inactive.activate().isActive()).toBe(true);
  });

  it('can be created as inactive', () => {
    expect(
      Employee.create(
        validInput({ status: EmployeeStatus.Inactive }),
        today,
      ).isActive(),
    ).toBe(false);
  });
});

describe('Employee.rehydrate', () => {
  it('restores persisted state, even for rules that were valid when stored', () => {
    const stored = Employee.create(validInput(), today).toState();

    const restored = Employee.rehydrate(stored);

    expect(restored.toState()).toEqual(stored);
  });

  it('does not share mutable arrays with the caller', () => {
    const state = Employee.create(
      validInput({
        allowances: [{ type: 'HOUSING', month: '2026-03', amountMinor: 10 }],
      }),
      today,
    ).toState();
    const restored = Employee.rehydrate(state);

    state.allowances[0].amountMinor = 999;

    expect(restored.allowances[0].amountMinor).toBe(10);
  });
});
