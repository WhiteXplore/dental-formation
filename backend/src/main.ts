import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // ✅ Global validation
    app.useGlobalPipes(new ValidationPipe());

    // ✅ Enable cookie parser
    app.use(cookieParser());

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
    await app.listen(port, '0.0.0.0'); // <— critical for LAN access

    const appUrl = `http://localhost:${port}`;
    console.log(`🚀 Application running locally at: ${appUrl}`);
    console.log(`🌐 Accessible on LAN at: http://192.168.1.16:${port}`);
  } catch (error) {
    console.error('❌ Error starting application:', error);
    process.exit(1);
  }
}

bootstrap();
