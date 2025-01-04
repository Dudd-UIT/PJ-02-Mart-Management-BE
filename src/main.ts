import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { HttpException, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './filters/exceptions.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  app.setGlobalPrefix('v1/api', { exclude: [''] });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (validationErrors = []) => {
        const messages = validationErrors.map((error) => {
          if (error.constraints?.whitelistValidation) {
            return `Thuộc tính không hợp lệ: ${error.property}`;
          }
          return Object.values(error.constraints).join(', ');
        });

        return new HttpException({ statusCode: 400, message: messages }, 400);
      },
    }),
  );

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    credentials: true,
  });

  app.useGlobalFilters(new AllExceptionsFilter());
  // app.useGlobalInterceptors(new LoggingInterceptor()); // Thêm Interceptor

  await app.listen(port);
}
bootstrap();
