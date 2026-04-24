# node-logger v3.0.0 🚀

[![npm (scoped)](https://img.shields.io/npm/v/@17media/node-logger.svg)]()
[![Coverage Status](https://coveralls.io/repos/github/17media/node-logger/badge.svg?branch=master)](https://coveralls.io/github/17media/node-logger?branch=master)

[繁體中文版](./README.zh-TW.md)

Centralized logger for 17LIVE Node.JS projects.

> ... in the fires of Mount Doom, the dark lord Sauron forged, in secret, a **master logger** to control all others.<br>
> **"One logger to log them all!"**
>
> ![](https://i0.wp.com/media2.slashfilm.com/slashfilm/wp/wp-content/images/lordoftherings-ring-map.jpg)

## ✨ v3.0.0 Highlights
- **100% TypeScript**: Built-in types for perfect IDE autocomplete and type safety.
- **Modern Async**: Native `async/await` support for all logging tasks.
- **Zero Dependencies**: Lightweight and secure by removing lodash and other external libraries.
- **Industrial Stability**: 
  - **Timeout Protection**: Auto-discard tasks taking longer than 10s (e.g., Slack/Fluentd hangs).
  - **Recursion Safety**: Optimized iterative `flattenObject` with circular reference and max-depth protection.
- **100% Test Coverage**: Every logic path is verified by unit tests.

## 📦 Installation

```bash
yarn add @17media/node-logger
```

## 🛠 Configuration

```typescript
import { createLogger, Level } from '@17media/node-logger';

const loggerConfig = {
  // Shared configs
  base: {
    project: 'my-app',
    environment: 'production',
    logLevel: Level.INFO, // default level
  },
  // Slack service
  Slack: {
    slackToken: 'xoxb-xxx',
    slackChannel: '#alerts',
    logLevel: Level.ERROR, // Override for Slack
  },
  // Fluentd service
  Fluentd: {
    collectorUrl: 'http://localhost:24224',
  },
  // Console service
  Console: true,
};
```

## 🚀 Usage

### The Easy Way (Recommended)

```typescript
const logger = createLogger(loggerConfig)('auth-module');

await logger.info('User logged in', { userId: 123 });
await logger.error('DB connection failed', new Error('Timeout'));
```

### The Complete Way (Custom Message)

```typescript
import { Logger, LogMessage, ErrorMessage } from '@17media/node-logger';

const logger = new Logger(loggerConfig);

// Log with specific message object
await logger.Log(
  Level.WARN, 
  new LogMessage('Something happened', { detail: '...' }), 
  'custom-label'
);
```

## ⚙️ Environment Variable

Override log levels dynamically using the `LOG_LEVEL` environment variable (case-insensitive):

```bash
LOG_LEVEL=DEBUG node app.js
```

## 🛡 Security Features
- **Circular Reference Detection**: Automatically marks objects as `[Circular Reference]`.
- **Max Depth Protection**: Default limit is 10 levels, marks as `[Max Depth Reached]` beyond that.

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
