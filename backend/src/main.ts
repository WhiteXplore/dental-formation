import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import { ValidationPipe, Logger } from '@nestjs/common';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ✅ Enable CORS globally
  app.enableCors({
    origin: [
      'http://localhost:8080',
      'http://localhost:3000',
      'http://192.168.1.56:8080',
    ],
    methods: 'GET,PUT,POST,PATCH,DELETE,OPTIONS',
    credentials: true,
  });

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(cookieParser());

  // ✅ Static uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  const port = 3000;
  await app.listen(port);

  logger.log(`Application started at http://localhost:${port}`);
}

bootstrap();
