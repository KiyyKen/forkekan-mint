import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

/**
 * Mencatat setiap request selesai (method, path, status, durasi) — bagian
 * dari "Logging: Application — NestJS Logger" (docs/11-deployment.md).
 */
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const startedAt = Date.now();

    response.on('finish', () => {
      const durationMs = Date.now() - startedAt;
      this.logger.log(
        `${request.method} ${request.originalUrl} ${response.statusCode} ${durationMs}ms`,
      );
    });

    next();
  }
}
