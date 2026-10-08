import { ArgumentsHost, ForbiddenException, Logger } from '@nestjs/common';
import {
  BusinessRuleViolationError,
  ConflictError,
  DomainValidationError,
  NotFoundError,
} from '../errors/domain.error';
import { RequestValidationException } from '../errors/request-validation.exception';
import { ProblemDetails } from '../problem-details/problem-details.interface';
import { ProblemDetailsFilter } from './problem-details.filter';

class WidgetNotFoundError extends NotFoundError {
  readonly code = 'WIDGET_NOT_FOUND';
}
class WidgetExistsError extends ConflictError {
  readonly code = 'WIDGET_EXISTS';
}
class WidgetLockedError extends BusinessRuleViolationError {
  readonly code = 'WIDGET_LOCKED';
}

describe('ProblemDetailsFilter', () => {
  const filter = new ProblemDetailsFilter();
  let response: { status: jest.Mock; type: jest.Mock; json: jest.Mock };

  const run = (
    exception: unknown,
    headers: Record<string, string> = {},
  ): ProblemDetails => {
    const request = { method: 'GET', originalUrl: '/employees/1', headers };
    const host = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as unknown as ArgumentsHost;
    filter.catch(exception, host);

    return response.json.mock.calls[0][0] as ProblemDetails;
  };

  beforeEach(() => {
    response = {
      status: jest.fn().mockReturnThis(),
      type: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  it('maps NotFoundError to 404 with a problem+json body', () => {
    const problem = run(new WidgetNotFoundError('Widget 1 was not found.'));

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.type).toHaveBeenCalledWith('application/problem+json');
    expect(problem).toMatchObject({
      type: 'urn:problem:widget-not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Widget 1 was not found.',
      instance: '/employees/1',
      code: 'WIDGET_NOT_FOUND',
    });
  });

  it('maps ConflictError to 409', () => {
    expect(run(new WidgetExistsError('exists')).status).toBe(409);
  });

  it('maps BusinessRuleViolationError to 422', () => {
    expect(run(new WidgetLockedError('locked')).status).toBe(422);
  });

  it('maps DomainValidationError to 422 and includes field errors', () => {
    const problem = run(
      new DomainValidationError([
        { field: 'salary', message: 'must be positive' },
      ]),
    );

    expect(problem.status).toBe(422);
    expect(problem.errors).toEqual([
      { field: 'salary', message: 'must be positive' },
    ]);
  });

  it('maps request validation failures to 400 with field errors', () => {
    const problem = run(
      new RequestValidationException([
        { field: 'email', message: 'email must be an email' },
      ]),
    );

    expect(problem.status).toBe(400);
    expect(problem.code).toBe('REQUEST_VALIDATION_FAILED');
    expect(problem.errors).toEqual([
      { field: 'email', message: 'email must be an email' },
    ]);
  });

  it('keeps the status of Nest HttpExceptions', () => {
    const problem = run(new ForbiddenException('Nope'));

    expect(problem.status).toBe(403);
    expect(problem.detail).toBe('Nope');
  });

  it('maps client errors from body-parser (malformed JSON) to 400', () => {
    expect(
      run(Object.assign(new SyntaxError('Unexpected token'), { status: 400 }))
        .status,
    ).toBe(400);
  });

  it('returns 500 for unknown errors without leaking internals', () => {
    const problem = run(
      new Error('connection string postgres://user:secret@db'),
    );

    expect(problem.status).toBe(500);
    expect(problem.detail).toBe('An unexpected error occurred.');
    expect(JSON.stringify(problem)).not.toContain('secret');
    expect(Logger.prototype.error).toHaveBeenCalled();
  });

  it('reuses the incoming x-request-id as traceId, otherwise generates one', () => {
    expect(run(new Error('x'), { 'x-request-id': 'abc-123' }).traceId).toBe(
      'abc-123',
    );

    response.json.mockClear();
    expect(run(new Error('x')).traceId).toMatch(/^[0-9a-f-]{36}$/);
  });
});
