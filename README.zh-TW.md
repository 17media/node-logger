# node-logger v3.0.0 🚀

[![npm (scoped)](https://img.shields.io/npm/v/@17media/node-logger.svg)]()
[![Coverage Status](https://coveralls.io/repos/github/17media/node-logger/badge.svg?branch=master)](https://coveralls.io/github/17media/node-logger?branch=master)

[English Version](./README.md)

專為 17.Media Node.JS 專案設計的集中化 Logger 服務。

> ... 在末日火山的烈焰中，黑暗魔君索倫秘密打造了一個 **Master Logger**，用以統御所有服務。<br>
> **"One logger to log them all!"**
>
> ![](https://i0.wp.com/media2.slashfilm.com/slashfilm/wp/wp-content/images/lordoftherings-ring-map.jpg)

## ✨ v3.0.0 新功能
- **100% TypeScript**: 提供完善的型別定義與 IDE 自動補全。
- **Modern Async**: 全面支援 `async/await` 非同步操作。
- **Zero Dependencies**: 徹底移除 lodash 等外部依賴，極致輕量。
- **Industrial Stability**: 
  - **超時保護**: 單一服務 (Slack/Fluentd) 卡住超過 10 秒會自動放棄，不影響主程式運行。
  - **遞迴保護**: 優化過的迭代式物件拍平 (flattenObject)，支援極深層物件與循環引用。
- **100% Test Coverage**: 所有的核心邏輯路徑均經過單元測試驗證。

## 📦 安裝

```bash
yarn add @17media/node-logger
```

## 🛠 配置說明

```typescript
import { createLogger, Level } from '@17media/node-logger';

const loggerConfig = {
  // 共享配置
  base: {
    project: 'my-project',
    environment: 'production',
    logLevel: Level.INFO, // 預設最低 Log 層級
  },
  // Slack 服務
  Slack: {
    slackToken: 'xoxb-xxx',
    slackChannel: '#alerts',
    logLevel: Level.ERROR, // 僅 Error 以上層級才發送到 Slack
  },
  // Fluentd 服務
  Fluentd: {
    collectorUrl: 'http://localhost:24224',
  },
  // 控制台輸出
  Console: true,
};
```

## 🚀 使用方式

### 簡便用法 (推薦 90% 場景)

```typescript
const logger = createLogger(loggerConfig)('auth-module');

await logger.info('使用者已登入', { userId: 123 });
await logger.error('資料庫連線失敗', new Error('Timeout'));
```

### 進階用法 (自定義 Message 物件)

```typescript
import { Logger, LogMessage, ErrorMessage } from '@17media/node-logger';

const logger = new Logger(loggerConfig);

// 紀錄帶有特定標籤與自定義欄位的 Log
await logger.Log(
  Level.WARN, 
  new LogMessage('警告訊息', { detail: '...' }), 
  'custom-label'
);
```

## ⚙️ 環境變數

你可以透過 `LOG_LEVEL` 環境變數動態覆蓋所有服務的最低 Log 層級（不分大小寫）：

```bash
LOG_LEVEL=DEBUG node app.js
```

## 🛡 安全特性
- **循環參照偵測 (Circular Reference)**: 自動偵測物件中的循環引用並標註，防止序列化失敗。
- **最大深度保護**: 預設展開至 10 層，超過深度則標註為 `[Max Depth Reached]`，防止處理過大物件導致阻塞。

## 🛠 開發指南 (Development)

### 開發標準
- **嚴格型別**: 禁止使用 `any`。優先使用泛型或 `unknown` 搭配型別守衛。
- **測試要求**: 所有的 Pull Request 均需維持 100% 的邏輯與分支覆蓋率。
- **Git Hooks**: 每次 `git commit` 前會自動執行代碼風格檢查與 `tsc` 型別檢查。若檢查失敗將無法提交。

### 常用指令
- `yarn test`: 執行所有測試並產出覆蓋率報告。
- `yarn lint`: 檢查並自動修正代碼風格。
- `yarn build`: 手動觸發編譯（僅用於本地 `npm link` 測試）。

### 發佈流程 (Releasing)
本專案採用 CircleCI 自動化發佈流程。發佈新版本步驟如下：
1. 在 Pull Request 中更新 `package.json` 的版本號並同步更新 `CHANGELOG.md`。
2. 將 PR 合併至 `master` 分支。
3. 在本地建立並推送 Git Tag：
   ```bash
   git tag v3.0.x
   git push origin v3.0.x
   ```
4. CircleCI 偵測到新 Tag 後，會自動執行測試、編譯並發佈至 npm registry。
