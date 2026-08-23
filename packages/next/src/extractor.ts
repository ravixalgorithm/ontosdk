/* ─────────────────────────────────────────────────────────────────────────────
   SDK extractor entry point.
   `extractContent` and `ExtractionResult` come from @ontosdk/core/clean — the
   single source of truth for HTML→Markdown. This file keeps `generateStaticPayloads`,
   the build-time helper that walks Next's .html output and writes .md siblings,
   since that's specific to the SDK's compile-time CLI usage.
   ─────────────────────────────────────────────────────────────────────────── */

import { extractContent } from '@ontosdk/core/clean';
export { extractContent } from '@ontosdk/core/clean';
export type { ExtractionResult } from '@ontosdk/core/clean';

export async function generateStaticPayloads(
  nextAppDirDir: string,
  ontoPublicDir: string,
) {
  const fs = await import('fs');
  const path = await import('path');
  const { glob } = await import('glob');

  if (!fs.existsSync(nextAppDirDir)) {
    return;
  }

  const files = await glob('**/*.html', { cwd: nextAppDirDir });
  if (files.length === 0) return;

  if (!fs.existsSync(ontoPublicDir)) {
    fs.mkdirSync(ontoPublicDir, { recursive: true });
  }

  let totalFilesProcessed = 0;

  for (const file of files) {
    const inputPath = path.join(nextAppDirDir, file);
    const outputPathRelative = file.replace(/\.html$/, '.md');
    const outputPath = path.join(ontoPublicDir, outputPathRelative);

    try {
      const htmlContent = fs.readFileSync(inputPath, 'utf8');

      let routeName = file.replace(/\.html$/, '');
      if (routeName === 'index') routeName = '/';
      else routeName = `/${routeName}`;

      const result = extractContent(htmlContent, routeName);

      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(outputPath, result.markdown, 'utf8');
      totalFilesProcessed++;
    } catch (e: unknown) {
      console.error(`[Onto] Failed to process ${file}: ${(e as Error).message}`);
    }
  }
  console.log(
    `[Onto] Successfully generated ${totalFilesProcessed} semantic markdown endpoints.`,
  );
}
