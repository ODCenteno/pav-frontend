import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.ts', 'src/**/__tests__/**/*.tsx'],
    coverage: {
      provider: 'v8',
      include: [
        'src/utils/dataTransformer.ts',
        'src/utils/favorites.ts',
        'src/utils/translations.ts',
        'src/i18n/utils.ts',
      ],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 80,
        statements: 85,
      },
      reporter: ['text', 'lcov', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '.astro/',
        '**/*.d.ts',
        '**/*.astro',
        'src/types/',
        'src/data/',
        'src/lib/', // CMS client — covered by component-level tests, mostly thin orchestration
        'src/utils/navigation.ts', // requires Astro i18n module
        'src/utils/strapiTransformer.ts', // pure data mapping; covered by integration tests on the page level
        'src/utils/socialConfig.ts', // static config data, no logic
        'src/components/guide/__tests__/GuideAmenities.test.ts', // asserts source file contents, not runtime behavior
        'src/lib/__tests__/**', // mocks the network; not runtime behavior
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
    },
  },
});