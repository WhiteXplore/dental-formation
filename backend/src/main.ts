import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import { join } from 'path';

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // ✅ Increase payload size limit
    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

    // ✅ Global validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // ✅ Enable cookie parser
    app.use(cookieParser());

    // ✅ Serve static files from uploads folder
    app.useStaticAssets(join(__dirname, '..', 'uploads'), {
      prefix: '/uploads/',
    });

    // ✅ CORS configuration
    const whiteList = [
      'http://localhost:8080',
      'http://localhost:5173',
      'http://192.168.1.16:8080',
      'http://192.168.1.16:5173',
    ];

    app.enableCors({
      origin: (origin, callback) => {
        const date = new Date().toLocaleString();
        if (!origin || whiteList.includes(origin)) {
          console.log(
            `✅ Allowed CORS: ${origin || 'Postman/Server'} @ ${date}`,
          );
          callback(null, true);
        } else {
          console.warn(`🚫 Blocked CORS: ${origin} @ ${date}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    // ✅ Listen on LAN and localhost
    const port = process.env.PORT || 8000;
    await app.listen(port, '0.0.0.0');

    console.log(`🚀 Application running locally at: http://localhost:${port}`);
    console.log(`🌐 Accessible on LAN at: http://192.168.1.16:${port}`);
  } catch (error) {
    console.error('❌ Error starting application:', error);
    process.exit(1);
  }
}

bootstrap();
