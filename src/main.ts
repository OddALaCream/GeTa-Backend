import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();
  const uploadsDir = join(process.cwd(), 'uploads');
  const placeholderPath = join(process.cwd(), 'public', 'upload-placeholder.svg');
  const imageExtensions = new Set([
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.webp',
    '.jfif',
    '.svg',
    '.bmp',
    '.avif',
  ]);

  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }

  expressApp.use('/uploads', express.static(uploadsDir, { fallthrough: true }));
  expressApp.get('/uploads/:filename', (req, res) => {
    const extension = extname(req.params.filename || '').toLowerCase();

    if (!imageExtensions.has(extension)) {
      return res.status(404).json({
        message: 'File not found',
        statusCode: 404,
      });
    }

    return res.type('image/svg+xml').sendFile(placeholderPath);
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application running on http://localhost:${port}/api`);
}
bootstrap();
