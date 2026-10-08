import { ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { RequestValidationException } from '../errors/request-validation.exception';
import { FieldError } from '../problem-details/problem-details.interface';

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) =>
      new RequestValidationException(flattenValidationErrors(errors)),
  });
}

export function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): FieldError[] {
  return errors.flatMap((error) => {
    const field = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;
    const own = Object.values(error.constraints ?? {}).map((message) => ({
      field,
      message,
    }));
    return [...own, ...flattenValidationErrors(error.children ?? [], field)];
  });
}
