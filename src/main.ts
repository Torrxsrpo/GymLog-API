import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { DomainExceptionFilter } from './common/filters/domain-exception.filter.js';

// import { DomainExceptionFilter } from './common/filters/domain-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new DomainExceptionFilter());

 


  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
