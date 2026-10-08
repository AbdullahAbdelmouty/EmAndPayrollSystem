import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  const config = app.get(ConfigService);

  const corsOrigin = config.get<string>('CORS_ORIGIN');
  if (corsOrigin) app.enableCors({ origin: corsOrigin });

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, prefix: false });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Employee & Payroll API')
      .setDescription(
        'Errors are returned as RFC 7807 problem+json. Money is in minor units (cents).',
      )
      .setVersion('1.0')
      .build(),
  );
  SwaggerModule.setup('docs', app, document);

  app.enableShutdownHooks();
  await app.listen(config.get<number>('PORT', 3000));
}

void bootstrap();
