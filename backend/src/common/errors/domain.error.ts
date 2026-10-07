import { FieldError } from '../problem-details/problem-details.interface';

export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export abstract class NotFoundError extends DomainError {}

export abstract class ConflictError extends DomainError {}

export abstract class BusinessRuleViolationError extends DomainError {}

export class DomainValidationError extends DomainError {
  readonly code = 'DOMAIN_VALIDATION_FAILED';

  constructor(readonly errors: FieldError[]) {
    super('One or more domain rules were violated.');
  }
}
