/**
 * Seed data awal (platform presets).
 *
 * Implementasi seed berada di apps/api/prisma/seed.ts (colocated dengan
 * schema Prisma). Script ini hanya delegasi agar dapat dijalankan dari root:
 *
 *   pnpm db:seed
 */

import { execSync } from 'node:child_process';

execSync('pnpm --filter @forkekan/api db:seed', { stdio: 'inherit' });
