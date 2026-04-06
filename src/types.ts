import type { CoverageReportOptions } from 'monocart-coverage-reports';

export type CoverageOptions = CoverageReportOptions & {
  /** Require `--coverage` CLI flag to activate the plugin. */
  requireFlag?: boolean;
  /** Custom MCR config file path, or `false` to skip config loading. */
  config?: string | false;
};
