import globals from 'globals';
import tseslint from 'typescript-eslint';

import base from './index.mjs';

/**
 * Flat config untuk aplikasi Node.js (NestJS API & worker).
 */
export default tseslint.config(...base, {
  files: ['**/*.ts'],
  languageOptions: {
    globals: globals.node,
  },
});
