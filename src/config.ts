import type { CoverageReportOptions } from 'monocart-coverage-reports';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { JSONC } from 'jsonc.min';

export const loadConfig = (
  cwd: string,
  customPath?: string | false
): CoverageReportOptions | undefined => {
  if (customPath === false) return;

  const expectedFiles = customPath
    ? [customPath]
    : ['mcr.config.json', 'mcr.config.jsonc'];

  for (const file of expectedFiles) {
    if (!isJsonConfig(file)) continue;

    const filePath = join(cwd, file);

    if (!existsSync(filePath)) continue;

    try {
      const content = readFileSync(filePath, 'utf8');

      return JSONC.parse(content) as CoverageReportOptions;
    } catch {}
  }
};

const scriptExtensions = new Set([
  '.js',
  '.mjs',
  '.cjs',
  '.ts',
  '.mts',
  '.cts',
]);

export const isJsonConfig = (configPath: string): boolean => {
  const dotIndex = configPath.lastIndexOf('.');
  if (dotIndex === -1) return true;

  return !scriptExtensions.has(configPath.slice(dotIndex));
};
