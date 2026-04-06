import type { CoverageReportOptions } from 'monocart-coverage-reports';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { JSONC } from 'jsonc.min';
import * as TOML from 'toml';
import YAML from 'yaml';

const scriptExtensions = new Set([
  '.js',
  '.mjs',
  '.cjs',
  '.ts',
  '.mts',
  '.cts',
]);

const getExtension = (filePath: string): string => {
  const dotIndex = filePath.lastIndexOf('.');
  if (dotIndex === -1) return '';
  return filePath.slice(dotIndex);
};

const isToml = (path: string): boolean => getExtension(path) === '.toml';
const isYaml = (path: string): boolean => {
  const ext = getExtension(path);
  return ext === '.yml' || ext === '.yaml';
};

const parseConfig = (
  content: string,
  filePath: string
): CoverageReportOptions => {
  if (isToml(filePath)) return TOML.parse(content) as CoverageReportOptions;
  if (isYaml(filePath)) return YAML.parse(content) as CoverageReportOptions;
  return JSONC.parse(content) as CoverageReportOptions;
};

export const isStaticConfig = (configPath: string): boolean => {
  const dotIndex = configPath.lastIndexOf('.');
  if (dotIndex === -1) return true;

  return !scriptExtensions.has(configPath.slice(dotIndex));
};

export const loadConfig = (
  cwd: string,
  customPath?: string | false
): CoverageReportOptions | undefined => {
  if (customPath === false) return;

  const expectedFiles = customPath
    ? [customPath]
    : [
        'mcr.config.json',
        'mcr.config.jsonc',
        'mcr.config.toml',
        'mcr.config.yaml',
        'mcr.config.yml',
      ];

  for (const file of expectedFiles) {
    if (!isStaticConfig(file)) continue;

    const filePath = join(cwd, file);

    if (!existsSync(filePath)) continue;

    try {
      const content = readFileSync(filePath, 'utf8');

      return parseConfig(content, file);
    } catch {}
  }
};
