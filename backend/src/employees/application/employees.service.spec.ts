import { DomainValidationError } from '../../common/errors/domain.error';
import { Clock } from '../../common/time/clock';
import { EmployeeStatus } from '../domain/employee-status.enum';
import { DuplicateEmailError } from '../domain/errors/duplicate-email.error';
import { EmployeeNotFoundError } from '../domain/errors/employee-not-found.error';
import { InMemoryEmployeeRepository } from '../infrastructure/in-memory-employee.repository';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeesService } from './employees.service';

const fixedClock: Clock = { now: () => new Date('2026-10-07T12:00:00Z') };

const newEmployee = (
  overrides: Partial<CreateEmployeeDto> = {},
): CreateEmployeeDto => ({
  fullName: 'Ana Silva',
  email: 'ana@acme.com',
  jobTitle: 'Engineer',
  department: 'Engineering',
  hireDate: '2024-03-01',
  baseSalaryMinor: 500_000,
  ...overrides,
});

describe('EmployeesService', () => {
  let repository: InMemoryEmployeeRepository;
  let service: EmployeesService;

  beforeEach(() => {
    repository = new InMemoryEmployeeRepository();
    service = new EmployeesService(repository, fixedClock);
  });

  describe('create', () => {
    it('creates an active employee with a generated id and persists it', async () => {
      const created = await service.create(
        newEmployee({ email: 'Ana@ACME.com' }),
      );

      expect(created.id.length).toBe(36);
      expect(created.email).toBe('ana@acme.com');
      expect(created.status).toBe(EmployeeStatus.Active);
      expect(await repository.findById(created.id)).toBe(created);
    });

    it('rejects a duplicate email regardless of letter case', async () => {
      await service.create(newEmployee());

      await expect(
        service.create(newEmployee({ email: 'ANA@acme.com' })),
      ).rejects.toThrow(DuplicateEmailError);
    });

    it('rejects a hire date after the clock date and stores nothing', async () => {
      await expect(
        service.create(newEmployee({ hireDate: '2026-10-08' })),
      ).rejects.toThrow(DomainValidationError);

      expect((await repository.search({ page: 1, pageSize: 10 })).total).toBe(
        0,
      );
    });

    it('accepts a hire date equal to the clock date', async () => {
      const created = await service.create(
        newEmployee({ hireDate: '2026-10-07' }),
      );

      expect(created.hireDate).toBe('2026-10-07');
    });

    it('reports invalid data before checking for email conflicts', async () => {
      await service.create(newEmployee());

      await expect(
        service.create(newEmployee({ baseSalaryMinor: 0 })),
      ).rejects.toThrow(DomainValidationError);
    });

    it('stores allowances and deductions', async () => {
      const created = await service.create(
        newEmployee({
          allowances: [{ type: 'transport', month: '2026-10', amountMinor: 5_000 }],
          deductions: [{ type: 'LOAN', month: '2026-10', amountMinor: 1_000 }],
        }),
      );

      expect(created.allowances).toEqual([
        { type: 'TRANSPORT', month: '2026-10', amountMinor: 5_000 },
      ]);
      expect(created.deductions).toEqual([
        { type: 'LOAN', month: '2026-10', amountMinor: 1_000 },
      ]);
    });
  });

  describe('get', () => {
    it('returns an existing employee', async () => {
      const created = await service.create(newEmployee());

      expect((await service.get(created.id)).fullName).toBe('Ana Silva');
    });

    it('throws EmployeeNotFoundError for an unknown id', async () => {
      await expect(service.get('missing')).rejects.toThrow(
        EmployeeNotFoundError,
      );
    });
  });

  describe('list', () => {
    it('passes search, filters and paging to the repository', async () => {
      await service.create(
        newEmployee({
          fullName: 'Ana Silva',
          email: 'ana@acme.com',
          department: 'Engineering',
        }),
      );
      await service.create(
        newEmployee({
          fullName: 'Bruno Costa',
          email: 'bruno@acme.com',
          department: 'Sales',
        }),
      );
      await service.create(
        newEmployee({
          fullName: 'Carla Dias',
          email: 'carla@acme.com',
          department: 'Sales',
        }),
      );

      const sales = await service.list({
        department: 'Sales',
        page: 1,
        pageSize: 1,
      });
      const search = await service.list({
        search: 'ana',
        page: 1,
        pageSize: 10,
      });

      expect(sales.items.map((e) => e.fullName)).toEqual(['Bruno Costa']);
      expect(sales.total).toBe(2);
      expect(search.items.map((e) => e.fullName)).toEqual(['Ana Silva']);
    });
  });

  describe('update', () => {
    it('applies partial changes and persists them', async () => {
      const created = await service.create(newEmployee());

      const updated = await service.update(created.id, {
        jobTitle: 'Tech Lead',
        baseSalaryMinor: 650_000,
      });

      expect(updated.jobTitle).toBe('Tech Lead');
      expect(updated.fullName).toBe('Ana Silva');
      expect((await repository.findById(created.id))?.baseSalaryMinor).toBe(
        650_000,
      );
    });

    it('throws EmployeeNotFoundError for an unknown id', async () => {
      await expect(
        service.update('missing', { jobTitle: 'X' }),
      ).rejects.toThrow(EmployeeNotFoundError);
    });

    it('allows keeping the same email', async () => {
      const created = await service.create(newEmployee());

      const updated = await service.update(created.id, {
        email: 'ANA@acme.com',
      });

      expect(updated.email).toBe('ana@acme.com');
    });

    it('rejects an email that belongs to another employee', async () => {
      await service.create(newEmployee({ email: 'ana@acme.com' }));
      const other = await service.create(
        newEmployee({ fullName: 'Bruno', email: 'bruno@acme.com' }),
      );

      await expect(
        service.update(other.id, { email: 'ana@acme.com' }),
      ).rejects.toThrow(DuplicateEmailError);
    });

    it('deactivates and reactivates through the status field', async () => {
      const created = await service.create(newEmployee());

      expect(
        (
          await service.update(created.id, { status: EmployeeStatus.Inactive })
        ).isActive(),
      ).toBe(false);
      expect(
        (
          await service.update(created.id, { status: EmployeeStatus.Active })
        ).isActive(),
      ).toBe(true);
    });

    it('rejects invalid changes and leaves the stored employee untouched', async () => {
      const created = await service.create(newEmployee());

      await expect(
        service.update(created.id, { baseSalaryMinor: -1 }),
      ).rejects.toThrow(DomainValidationError);

      expect((await repository.findById(created.id))?.baseSalaryMinor).toBe(
        500_000,
      );
    });
  });

  describe('delete', () => {
    it('removes the employee', async () => {
      const created = await service.create(newEmployee());

      await service.delete(created.id);

      expect(await repository.findById(created.id)).toBeNull();
    });

    it('throws EmployeeNotFoundError when nothing was deleted', async () => {
      await expect(service.delete('missing')).rejects.toThrow(
        EmployeeNotFoundError,
      );
    });
  });
});
