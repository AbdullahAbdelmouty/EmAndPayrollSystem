import { BadRequestException } from '@nestjs/common';
import { FieldError } from '../problem-details/problem-details.interface';

export class RequestValidationException extends BadRequestException {
  constructor(readonly errors: FieldError[]) {
    super('Request validation failed.');
  }
}
