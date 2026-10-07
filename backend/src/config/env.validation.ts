import { plainToInstance } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsString() @MinLength(1) DB_HOST!: string;
  @IsInt() @Min(1) @Max(65535) DB_PORT!: number;
  @IsString() @MinLength(1) DB_NAME!: string;
  @IsString() @MinLength(1) DB_USER!: string;
  @IsString() @MinLength(1) DB_PASSWORD!: string;
  @IsOptional() @IsString() DB_LOGGING?: string;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated);

  if (errors.length > 0) {
    const messages = errors.map(
      (e) => `${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`,
    );
    throw new Error(
      `Invalid environment configuration -> ${messages.join('; ')}`,
    );
  }
  return validated;
}
