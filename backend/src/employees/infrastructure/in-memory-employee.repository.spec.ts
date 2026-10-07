import { Employee } from '../domain/employee';
import { EmployeeStatus } from '../domain/employee-status.enum';
import { DuplicateEmailError } from '../domain/errors/duplicate-email.error';
import { InMemoryEmployeeRepository } from './in-memory-employee.repository';

const today = new Date('2026-10-07T12:00:00Z');

const employee = (
  n: number,
  overrides: Partial<Parameters<typeof Employee.create>[0]> = {},
): Employee =>
  Employee.create(
    {
      id: `00000000-0000-4000-8000-00000000000${n}`,
      fullName: `Person ${n}`,
      email: `person${n}@acme.com`,
      jobTitle: 'Engineer',
      department: 'Engineering',
      hireDate: '2024-01-01',
      baseSalaryMinor: 100_000,
      ...overrides,
    },
    today,
  );

describe('InMemoryEmployeeRepository', () => {
  let repository: InMemoryEmployeeRepository;

  beforeEach(() => {
    repository = new InMemoryEmployeeRepository();
  });

  it('saves and finds by id and by (case-insensitive) email', async () => {
    const saved = employee(1);
    await repository.save(saved);

    expect(await repository.findById(saved.id)).toBe(saved);
    expect((await repository.findByEmail(' PERSON1@acme.com '))?.id).toBe(
      saved.id,
    );
    expect(await repository.findById('missing')).toBeNull();
  });

  it('rejects a different employee with an existing email', async () => {
    await repository.save(employee(1));

    await expect(
      repository.save(employee(2, { email: 'person1@acme.com' })),
    ).rejects.toThrow(DuplicateEmailError);
  });

  it('allows re-saving the same employee (update) with the same email', async () => {
    const original = employee(1);
    await repository.save(original);

    await repository.save(original.update({ jobTitle: 'Lead' }, today));

    expect((await repository.findById(original.id))?.jobTitle).toBe('Lead');
  });

  it('deletes and reports whether something was deleted', async () => {
    await repository.save(employee(1));

    expect(await repository.delete(employee(1).id)).toBe(true);
    expect(await repository.delete(employee(1).id)).toBe(false);
  });

  describe('search', () => {
    beforeEach(async () => {
      await repository.save(
        employee(1, { fullName: 'Carla Dias', department: 'Sales' }),
      );
      await repository.save(
        employee(2, { fullName: 'Ana Silva', department: 'Engineering' }),
      );
      await repository.save(
        employee(3, {
          fullName: 'Bruno Costa',
          department: 'Engineering',
          status: EmployeeStatus.Inactive,
        }),
      );
    });

    it('orders by full name', async () => {
      const result = await repository.search({ page: 1, pageSize: 10 });

      expect(result.items.map((e) => e.fullName)).toEqual([
        'Ana Silva',
        'Bruno Costa',
        'Carla Dias',
      ]);
      expect(result.total).toBe(3);
    });

    it('matches name or email, case-insensitively', async () => {
      expect(
        (
          await repository.search({ search: 'ANA', page: 1, pageSize: 10 })
        ).items.map((e) => e.fullName),
      ).toEqual(['Ana Silva']);
      expect(
        (await repository.search({ search: 'person3@', page: 1, pageSize: 10 }))
          .total,
      ).toBe(1);
    });

    it('filters by department and status together', async () => {
      const result = await repository.search({
        department: 'Engineering',
        status: EmployeeStatus.Active,
        page: 1,
        pageSize: 10,
      });

      expect(result.items.map((e) => e.fullName)).toEqual(['Ana Silva']);
    });

    it('paginates and reports the total across all pages', async () => {
      const second = await repository.search({ page: 2, pageSize: 2 });

      expect(second.items.map((e) => e.fullName)).toEqual(['Carla Dias']);
      expect(second.total).toBe(3);
      expect(second.page).toBe(2);
    });

    it('returns an empty page past the end', async () => {
      expect(
        (await repository.search({ page: 9, pageSize: 10 })).items,
      ).toEqual([]);
    });
  });
});
