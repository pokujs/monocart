import type { CoverageReportOptions } from 'monocart-coverage-reports';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { JSONC } from 'jsonc.min';
import { parse as tomlParse } from 'toml.min';
import { parse as yamlParse } from 'yaml.min';

const scriptExtensions = new Set([
  '.js',
  '.mjs',
  '.cjs',
  '.ts',
  '.mts',
  '.cts',
]);

const isScript = (path: string): boolean =>
  scriptExtensions.has(getExtension(path));

const isToml = (path: string): boolean => getExtension(path) === '.toml';

const isYaml = (path: string): boolean => {
  const ext = getExtension(path);
  return ext === '.yml' || ext === '.yaml';
};

const getExtension = (filePath: string): string => {
  const dotIndex = filePath.lastIndexOf('.');
  if (dotIndex === -1) return '';
  return filePath.slice(dotIndex);
};

const parseConfig = (
  content: string,
  filePath: string
): CoverageReportOptions => {
  if (isToml(filePath)) return tomlParse<CoverageReportOptions>(content);
  if (isYaml(filePath)) return yamlParse<CoverageReportOptions>(content);
  return JSONC.parse<CoverageReportOptions>(content);
};

export const loadConfig = (
  cwd: string,
  customPath?: string | false
): CoverageReportOptions | void => {
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
    if (isScript(file)) continue;

    const filePath = join(cwd, file);

    if (!existsSync(filePath)) continue;

    try {
      const content = readFileSync(filePath, 'utf8');

      return parseConfig(content, file);
    } catch {}
  }
};

export const isPluginConfig = (configPath: string): boolean => {
  const dotIndex = configPath.lastIndexOf('.');
  if (dotIndex === -1) return true;

  return !scriptExtensions.has(configPath.slice(dotIndex));
};
