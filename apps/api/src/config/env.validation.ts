import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, validateSync } from 'class-validator';

enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/** Nilai default JWT_SECRET pada .env.example — tidak boleh dipakai di production. */
const INSECURE_JWT_SECRET = 'change-me-in-production';

/**
 * Environment variable yang wajib tervalidasi saat bootstrap (fail-fast).
 * Hanya variabel tanpa fallback aman di kode (lihat DATABASE_URL/JWT_SECRET
 * pada masing-masing service) yang diwajibkan di sini — variabel lain
 * (REDIS_URL, CORS_ORIGIN, dll.) sudah memiliki default eksplisit.
 */
class EnvironmentVariables {
  @IsOptional()
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @IsString()
  @IsNotEmpty({ message: 'DATABASE_URL wajib diisi' })
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty({ message: 'JWT_SECRET wajib diisi' })
  JWT_SECRET: string;
}

/**
 * Dipasang pada `ConfigModule.forRoot({ validate })` — melempar error saat
 * bootstrap (bukan error samar di tengah request) bila environment variable
 * krusial belum diisi, sesuai docs/11-deployment.md (Production Checklist:
 * "Semua environment variable tersedia").
 */
export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { whitelist: false });
  const messages = errors.flatMap((error) => Object.values(error.constraints ?? {}));

  if (validated.NODE_ENV === NodeEnv.Production && validated.JWT_SECRET === INSECURE_JWT_SECRET) {
    messages.push('JWT_SECRET tidak boleh memakai nilai default .env.example di production');
  }

  if (messages.length > 0) {
    throw new Error(`Konfigurasi environment tidak valid: ${messages.join('; ')}`);
  }

  return validated;
}
