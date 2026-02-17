import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import { ValidationPipe, Logger } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const whitelist = [
    'https://toothformation.online:8080',
    'https://toothformation.online',
  ];

  const httpsOptions = {
    key: fs.readFileSync(join(__dirname, '../key.pem')),
    cert: fs.readFileSync(join(__dirname, '../certificate.pem')),
  };

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions,
    cors: {
      origin: (origin, callback) => {
        const curdate = new Date();
        if (!origin || whitelist.indexOf(origin) !== -1) {
          console.log(
            'Allowed CORS for:',
            origin + ' Date: ' + curdate.toString().substring(0, 24),
          );
          callback(null, true);
        } else {
          console.log(
            'Blocked CORS for:',
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
  });

  const logger = new Logger('Bootstrap');

  // Body parser to handle large payloads
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Cookie parser
  app.use(cookieParser());

  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('QCE Questions')
    .setDescription('QCE questions API')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: { defaultModelsExpandDepth: -1 },
  });

  const configService: ConfigService = app.get(ConfigService);

  await app.listen(8080);
  logger.log(`Application started and listening on ${8080}`);
}

bootstrap();
