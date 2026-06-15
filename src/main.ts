import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import * as express from 'express';
import { AppModule } from './app.module';
import {
  addManualSwaggerPaths,
  buildSwaggerCustomJs,
  buildSwaggerDescription,
} from './common/swagger/swagger.examples';

const REMOTE_IMAGE_TIMEOUT_MS = 10000;

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

  expressApp.get('/api/media/proxy', async (req, res) => {
    const rawUrl = Array.isArray(req.query.url) ? req.query.url[0] : req.query.url;

    if (!rawUrl || typeof rawUrl !== 'string') {
      return res.status(400).json({
        message: 'Missing media URL',
        statusCode: 400,
      });
    }

    let targetUrl: URL;

    try {
      targetUrl = new URL(rawUrl);
    } catch {
      return res.status(400).json({
        message: 'Invalid media URL',
        statusCode: 400,
      });
    }

    if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
      return res.status(400).json({
        message: 'Only http and https URLs are supported',
        statusCode: 400,
      });
    }

    try {
      const remoteResponse = await fetch(targetUrl, {
        redirect: 'follow',
        signal: AbortSignal.timeout(REMOTE_IMAGE_TIMEOUT_MS),
        headers: {
          Accept: 'image/*,*/*;q=0.8',
          'User-Agent': 'GeTaWeb Media Proxy',
        },
      });

      if (!remoteResponse.ok) {
        return res.status(remoteResponse.status).json({
          message: 'The remote image is not available',
          statusCode: remoteResponse.status,
        });
      }

      const contentType = remoteResponse.headers.get('content-type')?.toLowerCase() || '';

      if (!contentType.startsWith('image/')) {
        return res.status(415).json({
          message: 'The provided URL does not point to an image',
          statusCode: 415,
        });
      }

      const imageBuffer = Buffer.from(await remoteResponse.arrayBuffer());
      const cacheControl = remoteResponse.headers.get('cache-control');
      const contentLength = remoteResponse.headers.get('content-length');

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', cacheControl || 'public, max-age=3600');

      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }

      return res.status(200).send(imageBuffer);
    } catch {
      return res.status(502).json({
        message: 'Unable to fetch the remote image',
        statusCode: 502,
      });
    }
  });

  expressApp.use('/uploads', express.static(uploadsDir, { fallthrough: true }));
  expressApp.get(['/uploads', '/uploads/'], (_req, res) => {
    return res.type('image/svg+xml').sendFile(placeholderPath);
  });
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

  const allowedOrigins = new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    ...(process.env.FRONTEND_URL || '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  ]);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('GeTa API')
    .setDescription(buildSwaggerDescription())
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Pega aqui el token JWT o usa el panel de acceso rapido al inicio de la documentacion.',
      },
      'bearer',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig, {
    ignoreGlobalPrefix: false,
  });

  addManualSwaggerPaths(swaggerDocument);

  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    customSiteTitle: 'GeTa API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'list',
      defaultModelsExpandDepth: 2,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customJsStr: buildSwaggerCustomJs(),
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application running on http://localhost:${port}/api`);
  console.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}
bootstrap();
