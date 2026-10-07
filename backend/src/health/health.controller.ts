import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
} from '@nestjs/terminus';

@Controller({
  path: 'health',
  version: process.env.API_VERSION,
})
export class HealthController {
  constructor(private readonly health: HealthCheckService) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      async (): Promise<HealthIndicatorResult> => ({
        app: {
          status: 'up',
        },
      }),
    ]);
  }
}
