# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-04-24

### Added
- **TypeScript Support**: Full migration to TypeScript with built-in type definitions.
- **Async/Await Support**: All logging operations now return Promises and support `async/await`.
- **Timeout Protection**: Added a 10-second timeout for each logging service to prevent hanging processes.
- **Bilingual Documentation**: Added Traditional Chinese README (`README.zh-TW.md`).
- **Iterative flattenObject**: Improved `flattenObject` utility to be iterative, preventing stack overflow on deep objects.
- **Max Depth Protection**: Added configurable maximum depth (default 10) to `flattenObject`.
- **Dual-mode Support**: Native support for both ECMAScript Modules (ESM) and CommonJS (CJS).

### Changed
- **Upgrade @slack/web-api**: Migrated from legacy `@slack/client` to modern `@slack/web-api`.
- **Modernized Barrel Files**: Updated all `index.ts` files to use the `export { ... } from '...'` syntax.
- **Refined MasterLogger**: Improved error reporting in `MasterLogger` using `Promise.allSettled`.
- **Stricter Type Checking**: Enabled `strict` mode in TypeScript for the entire codebase.

### Removed
- **Zero Dependencies**: Removed `lodash`, `superagent`, and `deep-freeze` from dependencies. The library now uses native `fetch` and built-in JavaScript features for maximum performance and minimum size.
- **Legacy index.d.ts**: Removed manually maintained declaration file.

### Fixed
- **Circular Reference Bug**: Improved detection and handling of circular references.
- **Log Level Case Sensitivity**: `LOG_LEVEL` environment variable is now case-insensitive.
- **Service Index Mismatch**: Fixed service name mismatch in error logs when filtering services.

## [2.1.1] - 2020-08-04

### Changed
- **Major Dependency Upgrade**: Updated many devDependencies and core dependencies:
  - `@slack/client`: ^4.2.0 > ^5.0.2
  - `lodash`: ^4.17.4 > ^4.17.19
  - `superagent`: ^3.5.2 > ^5.3.1
  - `eslint`, `jest`, `babel` and related plugins to newer versions.

## [2.1.0] - 2018-01-29

### Added
- **Slack Options**: Added support for Slack-specific options like `fields` (maxLine, short, excludes) and custom `getFooter` function.
- **TypeScript Declaration**: Initial manual `index.d.ts` provided.

## [2.0.0] - 2017-08-16

### Changed
- **Testing Framework**: Refactored tests from Mocha/Chai to Jest.
- **Structure**: Moved testing files inside corresponding folders.
- **Async Logging**: `MasterLogger.Log()` now returns a Promise, allowing callers to wait for logging to complete.

### Added
- **Fluentd Key Processing**: Automatically replace `.` with `_` in object keys for Fluentd compatibility.
- **Lock Files**: Added `yarn.lock` and `package-lock.json`.

## [1.1.0] - 2017-07-20

### Added
- **Utility**: Added `flattenObject` utility.
- **Circular Reference Protection**: Basic protection against circular references in log objects.
- **Extended Messages**: Added `LogMessage` and `ErrorMessage` classes for better API structure.
- **Environment Override**: Support overriding minimum log level via `process.env.LOG_LEVEL`.

## [1.0.1] - 2017-06-27

### Added
- **Initial Release**: Centralized logger with support for Console, Slack, and Fluentd.
- **Basic Configuration**: Flexible config structure for multi-service logging.

---
[3.0.0]: https://github.com/17media/node-logger/compare/v2.1.1...v3.0.0
[2.1.1]: https://github.com/17media/node-logger/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/17media/node-logger/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/17media/node-logger/compare/v1.1.0...v2.0.0
[1.1.0]: https://github.com/17media/node-logger/compare/v1.0.1...v1.1.0
