import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { diskStorage } from 'multer';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const uploadsDir = join(process.cwd(), 'uploads');
const allowedMimeTypes = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/avif',
  'video/mp4',
  'video/webm',
  'video/ogg',
]);
const allowedExtensions = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.jfif',
  '.svg',
  '.bmp',
  '.avif',
  '.mp4',
  '.webm',
  '.ogg',
]);

function ensureUploadsDir() {
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
}

@Controller('uploads')
export class UploadsController {
  @Post('media')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          ensureUploadsDir();
          cb(null, uploadsDir);
        },
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname || '').toLowerCase();
          cb(null, `${randomUUID()}${extension}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const extension = extname(file.originalname || '').toLowerCase();
        const isAllowed = allowedMimeTypes.has(file.mimetype) && allowedExtensions.has(extension);

        cb(null, isAllowed);
      },
      limits: {
        fileSize: 25 * 1024 * 1024,
      },
    }),
  )
  uploadMedia(@UploadedFile() file: { filename: string }, @Req() req: Request) {
    if (!file) {
      throw new BadRequestException('Selecciona una imagen o video valido para subir.');
    }

    const mediaUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

    return {
      mediaUrl,
      path: `/uploads/${file.filename}`,
    };
  }
}
