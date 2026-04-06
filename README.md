<div align="center">
<img height="180" alt="Poku's Logo" src="https://raw.githubusercontent.com/wellwelwel/poku/main/.github/assets/readme/poku.svg">

# @pokujs/monocart

Enjoying **Poku**? [Give him a star to show your support](https://github.com/wellwelwel/poku) ⭐

</div>

---

📚 [**Documentation**](https://poku.io/docs/documentation/helpers/coverage/monocart)

---

☔️ [**@pokujs/monocart**](https://github.com/pokujs/monocart) is a **Poku** plugin for native **V8** code coverage using [**monocart-coverage-reports**](https://github.com/cenfun/monocart-coverage-reports).

> [!TIP]
>
> **@pokujs/monocart** supports **JSONC** config files (`mcr.config.json`, `mcr.config.jsonc`) out of the box, allowing comments in your configuration. You can also use **JS**, **CJS**, **MJS**, and **TS** config files, or set options directly in the plugin.

---

## Quickstart

### Install

```bash
npm i -D @pokujs/monocart
```

### Usage

```js
// poku.config.js
import { coverage } from '@pokujs/monocart';
import { defineConfig } from 'poku';

export default defineConfig({
  plugins: [coverage()],
});
```

Run `poku` and a coverage report will be generated after your test results.

> [!IMPORTANT]
>
> This plugin relies on **Node.js**' built-in `NODE_V8_COVERAGE` environment variable to collect coverage data. **Bun** and **Deno** do not support this mechanism, so coverage data will not be collected when running tests with these runtimes.

---

## Options

The plugin accepts all [**monocart-coverage-reports** options](https://github.com/cenfun/monocart-coverage-reports#options) plus two plugin-specific options:

```js
coverage({
  // Plugin options
  requireFlag: true, // default: false — require `--coverage` CLI flag to activate
  config: 'mcr.config.js', // default: auto-discover — custom MCR config file path, or `false` to skip

  // All monocart-coverage-reports options are supported, for example:
  reports: ['v8', 'console-details'],
  outputDir: './coverage-reports',
  entryFilter: { '**/node_modules/**': false, '**/src/**': true },
  sourceFilter: { '**/src/**': true },
  lcov: true,
  watermarks: [50, 80],
  all: './src',
  // ...
});
```

---

## Examples

### Console coverage details

```js
coverage({
  reports: ['console-details'],
  filter: { '**/node_modules/**': false, '**/src/**': true },
});
```

### Generate V8 HTML and LCOV reports

```js
coverage({
  reports: ['v8', 'lcovonly'],
  filter: { '**/node_modules/**': false, '**/src/**': true },
});
```

### Multiple reporters

```js
coverage({
  reports: [
    'v8',
    'console-details',
    'codecov',
    ['lcovonly', { file: 'lcov.info' }],
  ],
  filter: { '**/node_modules/**': false, '**/src/**': true },
});
```

### Include untested files

```js
coverage({
  reports: ['console-details'],
  filter: { '**/node_modules/**': false, '**/src/**': true },
  all: './src',
});
```

### Enforce coverage thresholds

Use the `onEnd` hook from [**monocart-coverage-reports**](https://github.com/cenfun/monocart-coverage-reports?tab=readme-ov-file#onend-hook):

```js
coverage({
  reports: ['console-details'],
  filter: { '**/node_modules/**': false, '**/src/**': true },
  onEnd: (results) => {
    const { summary } = results;
    if (summary.lines.pct < 80) {
      console.error(`Lines coverage ${summary.lines.pct}% is below 80%`);
      process.exitCode = 1;
    }
  },
});
```

### Require `--coverage` flag

By default, coverage runs whenever the plugin is active. Use `requireFlag` to only collect coverage when `--coverage` is passed to the CLI, keeping watch mode, debugging, and filtered runs fast:

```js
coverage({
  reports: ['console-details'],
  filter: { '**/node_modules/**': false, '**/src/**': true },
  requireFlag: true,
});
```

```bash
# No coverage (plugin is a no-op)
poku test/

# With coverage
poku --coverage test/
```

### Using a config file

Use any [monocart-coverage-reports config file](https://github.com/cenfun/monocart-coverage-reports#config-file) (`mcr.config.js`, `mcr.config.cjs`, `mcr.config.mjs`, `mcr.config.json`, `mcr.config.jsonc`, `mcr.config.ts`):

```js
// mcr.config.js
export default {
  reports: ['v8', 'console-details', 'codecov'],
  filter: { '**/node_modules/**': false, '**/src/**': true },
};
```

JSONC config files support comments:

```jsonc
// mcr.config.jsonc
{
  // V8 and console reports
  "reports": ["v8", "console-details"],
  "filter": {
    "**/node_modules/**": false,
    "**/src/**": true,
  },
}
```

```js
// poku.config.js
coverage({
  config: 'mcr.config.jsonc', // or false to disable config file discovery
});
```

When no `config` is specified, the plugin automatically searches for `mcr.config.json`, and `mcr.config.jsonc` in the working directory, and [**monocart-coverage-reports**](https://github.com/cenfun/monocart-coverage-reports) searches for `mcr.config.js`, `mcr.config.cjs`, `mcr.config.mjs`, and `mcr.config.ts`.

You can also specify the config path via CLI:

```bash
poku --coverageConfig=mcr.config.jsonc test/
```

> [!NOTE]
>
> **Priority order:**
>
> - For config file discovery: `--coverageConfig` (CLI) > `config` (plugin option) > auto-discovery
> - For coverage options: plugin options > config file options

---

## How It Works

- **`setup`** creates a temp directory and sets `NODE_V8_COVERAGE` — every test process spawned by **Poku** automatically writes **V8** coverage data
- **`teardown`** uses [**monocart-coverage-reports**](https://github.com/cenfun/monocart-coverage-reports) to read coverage data from the temp directory, generate reports, then cleans up
- No modification to test commands or runner configuration needed

---

## License

**MIT** © [**wellwelwel**](https://github.com/wellwelwel) and [**contributors**](https://github.com/pokujs/monocart/graphs/contributors).
