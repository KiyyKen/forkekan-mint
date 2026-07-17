import { validateEnv } from './env.validation';

function baseConfig(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
    JWT_SECRET: 'a-real-secret',
    ...overrides,
  };
}

describe('validateEnv', () => {
  it('meloloskan konfigurasi minimal yang valid', () => {
    expect(() => validateEnv(baseConfig())).not.toThrow();
  });

  it('mengisi NODE_ENV default ke development bila tidak diisi', () => {
    const result = validateEnv(baseConfig());
    expect(result.NODE_ENV).toBe('development');
  });

  it('menolak DATABASE_URL kosong', () => {
    expect(() => validateEnv(baseConfig({ DATABASE_URL: '' }))).toThrow(/DATABASE_URL/);
  });

  it('menolak JWT_SECRET kosong', () => {
    expect(() => validateEnv(baseConfig({ JWT_SECRET: '' }))).toThrow(/JWT_SECRET/);
  });

  it('menolak NODE_ENV di luar enum yang diizinkan', () => {
    expect(() => validateEnv(baseConfig({ NODE_ENV: 'staging' }))).toThrow();
  });

  it('menolak JWT_SECRET default .env.example saat NODE_ENV=production', () => {
    expect(() =>
      validateEnv(baseConfig({ NODE_ENV: 'production', JWT_SECRET: 'change-me-in-production' })),
    ).toThrow(/JWT_SECRET/);
  });

  it('mengizinkan JWT_SECRET default di development (bukan production)', () => {
    expect(() =>
      validateEnv(baseConfig({ NODE_ENV: 'development', JWT_SECRET: 'change-me-in-production' })),
    ).not.toThrow();
  });
});
