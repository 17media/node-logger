# node-logger v3.0.0 🚀

[![npm (scoped)](https://img.shields.io/npm/v/@17media/node-logger.svg)]()
[![Coverage Status](https://coveralls.io/repos/github/17media/node-logger/badge.svg?branch=master)](https://coveralls.io/github/17media/node-logger?branch=master)

[繁體中文版](./README.zh-TW.md)

Centralized logger for 17LIVE Node.JS projects.

## ✨ v3.0.0 Highlights
- **100% TypeScript**: Built-in types for perfect IDE autocomplete.
- **Modern Async**: Native `async/await` support for all logging tasks.
- **Zero Dependencies**: Lightweight and secure.
- **Backward Compatible**: 100% compatible with v2.x codebases.
- **100% Test Coverage**: Every logic path is verified.

## 🛠 Configuration

```typescript
import { createLogger, Level } from '@17media/node-logger';

const loggerConfig = {
  // Shared configs (Recommended v3 style)
  base: {
    project: 'my-app',
    environment: 'production',
    logLevel: Level.INFO,
  },
  // OR Legacy v2 style (project/environment at top level)
  // project: 'my-app',
  // environment: 'production',

  Slack: {
    slackToken: 'xoxb-xxx',
    slackChannel: '#alerts',
  },
  Console: true,
};
```

## 🚀 Usage

### 1. The Factory Way (Recommended for v3+)

This approach separates configuration initialization from label binding. It's ideal for multi-module projects where you want to share the same configuration factory across different parts of the application.

```typescript
import { createLogger } from '@17media/node-logger';

// 1. Initialize factory once
const loggerFactory = createLogger(loggerConfig);

// 2. Create labeled loggers in different modules
const logger = loggerFactory('auth-module');
const dbLogger = loggerFactory('db-module');

await logger.info('User logged in', { userId: 123 });
```

### 2. The Direct Way (Legacy v2.x Support)

If you are upgrading from an older version, your existing code **requires zero changes**.

```typescript
import { createLogger } from '@17media/node-logger';

// Directly create a logger instance with config and label
const logger = createLogger(loggerConfig, 'legacy-module');

await logger.warn('This still works perfectly!');
```

## 📋 API Differences (v2 vs v3)

| Feature | v2.x (Legacy) | v3.x (Modern) | Description |
| :--- | :--- | :--- | :--- |
| **Initialization** | `createLogger(conf, label)` | `createLogger(conf)(label)` | v3 supports Factory pattern for better reuse. |
| **Config Structure** | Top-level project info | Recommended inside `base` object | v3 auto-extracts top-level info for compatibility. |
| **Return Value** | Logger Instance | Logger Factory Function | v3 intelligently returns the right type based on args. |
| **Async Handling** | Returns `Promise<any>` | Returns `PromiseSettledResult[]` | v3 provides precise status for each service. |
| **Data Processing** | Basic object support | Date, Map, Set, Error support | v3 preserves much more information from complex objects. |

## 🛡 Security & Stability
- **Circular Reference**: Auto-detects and prevents infinite loops (Marks as `[Circular Reference]`).
- **Max Depth Protection**: Iterative flattening limited to 10 levels (customizable).
- **Timeout Protection**: Auto-discard tasks taking longer than 10s to prevent blocking your app.

## 🛠 Development

### Standards
- **Strict Typing**: No `any` allowed. Use generics or `unknown` with type guards.
- **Testing**: 100% logic and branch coverage is required for all PRs.
- **Git Hooks**: Pre-commit hooks run `eslint` and `tsc --noEmit`. Commits will fail if there are linting or type errors.

### Useful Commands
- `yarn test`: Run all tests with coverage report.
- `yarn lint`: Check and fix code style.
- `yarn build`: Manually trigger build (mainly for local `npm link` testing).

### Releasing
Releases are automated via CircleCI. To publish a new version:
1. Update the version in `package.json` and `CHANGELOG.md` in your PR.
2. Merge the PR into the `master` branch.
3. Create and push a Git tag:
   ```bash
   git tag v3.0.x
   git push origin v3.0.x
   ```
4. CircleCI will detect the tag, run tests, build the project, and publish it to the npm registry.
