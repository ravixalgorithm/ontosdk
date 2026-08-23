import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/clean.ts', 'src/score.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  bundle: true,
  // Inline the GFM plugin so file:-linked consumers (onto-api) and
  // transpilePackages consumers (marketing site) don't need it installed
  // separately. `turndown`/`cheerio` stay external — that path already works.
  noExternal: ['turndown-plugin-gfm'],
  outDir: 'dist',
  minify: false,
});
