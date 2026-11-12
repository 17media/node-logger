/**
 * 打包後 smoke test：以 `npm pack` 產出的 tarball 驗證 ESM 具名 import、default import 與 CJS require。
 * 需先執行 `yarn build`。相依套件透過 symlink 指向專案的 node_modules，不需網路。
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workDir = mkdtempSync(join(tmpdir(), 'node-logger-smoke-'));

const config = `{
  base: { project: 'smoke', environment: 'test', logLevel: Level.INFO },
  Console: true,
}`;

const cases = {
  'esm-named.mjs': `
import { createLogger, Level, Logger, Slack, Fluentd, Console, LogMessage, ErrorMessage } from '@17live/node-logger';
for (const [name, value] of Object.entries({ Logger, Slack, Fluentd, Console, LogMessage, ErrorMessage })) {
  if (!value) throw new Error(\`named export \${name} is missing\`);
}
const logger = createLogger(${config})('esm-named');
await logger.info('esm named import works');
`,
  'esm-default.mjs': `
import pkg from '@17live/node-logger';
const { createLogger, Level } = pkg;
const logger = createLogger(${config}, 'esm-default');
await logger.info('esm default import works');
`,
  'cjs-require.cjs': `
const { createLogger, Level } = require('@17live/node-logger');
const logger = createLogger(${config}, 'cjs-require');
logger.info('cjs require works').then(() => {});
`,
};

try {
  const [{ filename }] = JSON.parse(
    execFileSync('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', workDir], { cwd: root, encoding: 'utf8' }),
  );

  const pkgDir = join(workDir, 'node_modules', '@17live', 'node-logger');
  mkdirSync(pkgDir, { recursive: true });
  execFileSync('tar', ['-xzf', join(workDir, filename), '-C', pkgDir, '--strip-components=1']);
  symlinkSync(join(root, 'node_modules'), join(pkgDir, 'node_modules'), 'dir');

  for (const [file, code] of Object.entries(cases)) {
    writeFileSync(join(workDir, file), code);
    execFileSync(process.execPath, [file], { cwd: workDir, stdio: 'inherit' });
    console.log(`✔ ${file}`);
  }
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
