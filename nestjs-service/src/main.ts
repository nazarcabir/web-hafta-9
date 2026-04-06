import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Rfc7807Filter } from './common/filters/rfc7807.filter';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  }));
  app.enableCors();

  // Validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  
  // RFC 7807 Error Filter
  app.useGlobalFilters(new Rfc7807Filter());

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('CampusConnect API')
    .setDescription('The CampusConnect API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api-docs`);
}
bootstrap();
