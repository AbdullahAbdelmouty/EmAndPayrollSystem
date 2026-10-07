import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { STATUS_CODES } from 'http';
import {
  BusinessRuleViolationError,
  ConflictError,
  DomainError,
  DomainValidationError,
  NotFoundError,
} from '../errors/domain.error';
import { RequestValidationException } from '../errors/request-validation.exception';
import {
  FieldError,
  PROBLEM_JSON,
  ProblemDetails,
} from '../problem-details/problem-details.interface';

interface ResolvedProblem {
  status: number;
  detail?: string;
  code?: string;
  errors?: FieldError[];
}

type DomainErrorKind = abstract new (...args: never[]) => DomainError;

const DOMAIN_ERROR_STATUS: ReadonlyArray<readonly [DomainErrorKind, number]> = [
  [NotFoundError, 404],
  [ConflictError, 409],
  [BusinessRuleViolationError, 422],
  [DomainValidationError, 422],
];

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    const traceId = this.resolveTraceId(request);
    const problem = this.toProblemDetails(
      this.resolve(exception),
      request,
      traceId,
    );
    this.log(exception, problem, request);

    response.status(problem.status).type(PROBLEM_JSON).json(problem);
  }

  private resolve(exception: unknown): ResolvedProblem {
    if (exception instanceof RequestValidationException) {
      return {
        status: 400,
        detail: 'One or more fields are invalid.',
        code: 'REQUEST_VALIDATION_FAILED',
        errors: exception.errors,
      };
    }
    if (exception instanceof DomainError) {
      return this.resolveDomainError(exception);
    }
    if (exception instanceof HttpException) {
      return {
        status: exception.getStatus(),
        detail: this.extractMessage(exception),
      };
    }
    if (this.isClientHttpError(exception)) {
      return {
        status: exception.status,
        detail: 'The request could not be processed.',
      };
    }
    return { status: 500, detail: 'An unexpected error occurred.' };
  }

  private resolveDomainError(error: DomainError): ResolvedProblem {
    const rule = DOMAIN_ERROR_STATUS.find(([kind]) => error instanceof kind);
    return {
      status: rule ? rule[1] : 500,
      detail: error.message,
      code: error.code,
      errors: error instanceof DomainValidationError ? error.errors : undefined,
    };
  }

  private extractMessage(exception: HttpException): string {
    const body = exception.getResponse();
    if (typeof body === 'string') return body;
    const message = (body as { message?: string | string[] }).message;
    return Array.isArray(message)
      ? message.join('; ')
      : (message ?? exception.message);
  }

  // Errors raised by body-parser (malformed JSON, payload too large) are not Nest HttpExceptions.
  private isClientHttpError(
    exception: unknown,
  ): exception is { status: number } {
    const status = (exception as { status?: unknown } | null)?.status;
    return typeof status === 'number' && status >= 400 && status < 500;
  }

  private toProblemDetails(
    resolved: ResolvedProblem,
    request: Request,
    traceId: string,
  ): ProblemDetails {
    return {
      type: resolved.code
        ? `urn:problem:${resolved.code.toLowerCase().replace(/_/g, '-')}`
        : 'about:blank',
      title: STATUS_CODES[resolved.status] ?? 'Error',
      status: resolved.status,
      detail: resolved.detail,
      instance: request.originalUrl,
      code: resolved.code,
      traceId,
      errors: resolved.errors,
    };
  }

  private resolveTraceId(request: Request): string {
    const header = request.headers['x-request-id'];
    return typeof header === 'string' && header.length > 0
      ? header
      : randomUUID();
  }

  private log(
    exception: unknown,
    problem: ProblemDetails,
    request: Request,
  ): void {
    const summary = `${request.method} ${request.originalUrl} -> ${problem.status} [${problem.traceId}]`;
    if (problem.status >= 500) {
      this.logger.error(
        summary,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(`${summary}: ${problem.detail}`);
    }
  }
}
