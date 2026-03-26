import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3004',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
