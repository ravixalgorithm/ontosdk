import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts', 'src/cli.ts', 'src/middleware.ts', 'src/OntoHead.tsx', 'src/OntoProvider.tsx', 'src/config.ts', 'src/schemas.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    bundle: true,
    outDir: 'dist',
    minify: true,
    // @ontosdk/core is a proper npm dependency now — keep it external so the
    // engine ships independently and isn't duplicated when consumers also pull it.
    external: ['next', 'react', '@ontosdk/core', '@ontosdk/core/clean', '@ontosdk/core/score'],
});
