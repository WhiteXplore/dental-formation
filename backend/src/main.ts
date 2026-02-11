import { NestApplication, NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as path from 'path';
import { json, urlencoded } from 'express';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  var whitelist = [
    'https://toothformation.online:8080',
    'https://toothformation.online'
    
  ];

  const httpsOptions = {
    key: fs.readFileSync(join(__dirname, '../key.pem')),
    cert: fs.readFileSync(join(__dirname, '../certificate.pem')),
  };

   const app = await NestFactory.create(AppModule, {
    cors: {
      origin: function (origin, callback) {
        let curdate = new Date();
        if (!origin || whitelist.indexOf(origin) !== -1) {
          // if (whitelist.indexOf(origin) !== -1) {

          console.log(
            'allowed cors for: ',
            origin + ' Date: ' + curdate.toString().substring(0, 24),
          );
          callback(null, true);
        } else {
          console.log(
            'blocked cors for: ',
            origin + ' Date: ' + curdate.toString().substring(0, 24),
          );
          callback(new Error('Not allowed by CORS'));
        }
      },
      allowedHeaders:
        'Origin, Authorization, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe',
      methods: 'GET,PUT,POST,PATCH,DELETE,UPDATE,OPTIONS',
      credentials: true,
    },

    httpsOptions,
   });
  const logger = new Logger(NestApplication.name);

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());

  app.use(json({ limit: '100mb' }));
  app.use(urlencoded({ limit: '100mb', extended: true }));
  const config = new DocumentBuilder()
    .setTitle('QCE Questions')
    .setDescription('QCE quiestions API')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: { defaultModelsExpandDepth: -1 },
  });

  const configService: ConfigService = app.get<ConfigService>(ConfigService);

  await app.listen(8080);
  logger.log(`Application started and listening on ${8080}`);
}

bootstrap();
  // try {
  //   const app = await NestFactory.create(AppModule, {
  //     httpsOptions: {
  //       key: fs.readFileSync(join(__dirname, '../key.pem')),
  //       cert: fs.readFileSync(join(__dirname, '../certificate.pem')),
  //     },
  //   } );

  //   // ✅ Global validation
  //   app.useGlobalPipes(new ValidationPipe());

  //   // ✅ Cookie parser
  //   app.use(cookieParser());

  //   // ✅ CORS configuration
  //   const whiteList = [
  //     'https://toothformation.online:8080',
  //     'http://localhost:5173',
  //     'http://192.168.1.16:8080',
  //     'http://192.168.1.16:5173',
  //   ];

  //   app.enableCors({
  //     origin: (origin, callback) => {
  //       const date = new Date().toLocaleString();
  //       if (!origin || whiteList.includes(origin)) {
  //         console.log(
  //           `✅ Allowed CORS: ${origin || 'Postman/Server'} @ ${date}`,
  //         );
  //         callback(null, true);
  //       } else {
  //         console.warn(`🚫 Blocked CORS: ${origin} @ ${date}`);
  //         callback(new Error('Not allowed by CORS'));
  //       }
  //     },
      
  //     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //     credentials: true,
      
  //   });

  //   // ✅ Listen on all interfaces (LAN + public)
  //   const port = process.env.PORT || 8000;
  //   await app.listen(port, '0.0.0.0');

  //   console.log(`🚀 HTTPS running at: https://toothformation.online:${port}`);
  //   console.log(`🌐 LAN access: https://192.168.1.16:${port}`);
  // } catch (error) {
  //   console.error('❌ Error starting application:', error);
  //   process.exit(1);
  // }

