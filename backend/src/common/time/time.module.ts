import { Module } from '@nestjs/common';
import { CLOCK, SystemClock } from './clock';

@Module({
  providers: [{ provide: CLOCK, useClass: SystemClock }],
  exports: [CLOCK],
})
export class TimeModule {}
