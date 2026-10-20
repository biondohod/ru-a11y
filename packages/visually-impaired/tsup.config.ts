import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  target: 'es2018',
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
});
