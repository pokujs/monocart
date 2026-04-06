import type { CoverageReportOptions } from 'monocart-coverage-reports';
import type { PokuPlugin } from 'poku/plugins';
import type { CoverageOptions } from './types.js';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { isJsonConfig, loadConfig } from './config.js';

export type { CoverageOptions } from './types.js';

const pluginKeys = new Set(['requireFlag', 'config']);

const getMcrOptions = (options: CoverageOptions): CoverageReportOptions => {
  const mcrOptions: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(options)) {
    if (!pluginKeys.has(key)) mcrOptions[key] = value;
  }

  return mcrOptions as CoverageReportOptions;
};

export const coverage = (
  options: CoverageOptions = Object.create(null)
): PokuPlugin => {
  let enabled = false;
  let tempDir: string;
  let originalEnv: string | undefined;
  let resolvedConfig: string | false | undefined;

  return {
    name: '@pokujs/monocart',

    setup(context) {
      if (options.requireFlag && !process.argv.includes('--coverage')) return;
      enabled = true;

      if (context.runtime !== 'node')
        console.warn(
          `[@pokujs/monocart] V8 coverage is only supported on Node.js (current runtime: ${context.runtime}). Coverage data may not be collected.`
        );

      const cliConfig = process.argv
        .find((arg) => arg.startsWith('--coverageConfig'))
        ?.split('=')[1];

      resolvedConfig = cliConfig ?? options.config;

      const fileConfig = loadConfig(context.cwd, resolvedConfig);
      if (fileConfig) options = { ...fileConfig, ...options };

      originalEnv = process.env.NODE_V8_COVERAGE;

      tempDir = mkdtempSync(join(tmpdir(), 'poku-monocart-'));

      try {
        rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // Best-effort cleanup
      }

      mkdirSync(tempDir, { recursive: true });
      process.env.NODE_V8_COVERAGE = tempDir;
    },

    async teardown() {
      if (!enabled) return;

      if (originalEnv !== undefined) process.env.NODE_V8_COVERAGE = originalEnv;
      else delete process.env.NODE_V8_COVERAGE;

      const { CoverageReport } = await import('monocart-coverage-reports');

      const mcr = new CoverageReport(getMcrOptions(options));

      const shouldLoadMcrConfig =
        resolvedConfig !== false &&
        (typeof resolvedConfig !== 'string' || !isJsonConfig(resolvedConfig));

      if (shouldLoadMcrConfig)
        await mcr.loadConfig(
          typeof resolvedConfig === 'string' ? resolvedConfig : undefined
        );

      await mcr.addFromDir(tempDir);
      await mcr.generate();

      try {
        rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // Best-effort cleanup
      }
    },
  };
};
