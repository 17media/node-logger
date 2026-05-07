# node-logger v3.0.0 🚀

Centralized logger for 17LIVE Node.JS projects.

## ✨ v3.0.0 亮點
- **100% TypeScript**: 完整型別定義，完美支援 IDE 自動補全與開發者體驗。
- **現代化非同步**: 所有日誌發送任務原生支援 `async/await`。
- **零依賴**: 移除 lodash 等外部套件，保持極致輕量與安全。
- **向下相容**: 100% 相容 v2.x 代碼，升級現有專案無需修改任何程式碼。
- **100% 測試覆蓋率**: 嚴格驗證所有邏輯路徑、邊界情況與極端案例。

## 🛠 配置說明

```typescript
import { createLogger, Level } from '@17live/node-logger';

const loggerConfig = {
  // 基礎配置 (建議 v3 寫法)
  base: {
    project: 'my-app',
    environment: 'production',
    logLevel: Level.INFO,
  },
  // 或者傳統 v2 寫法 (直接將 project/environment 放在頂層)
  // project: 'my-app',
  // environment: 'production',

  Slack: {
    slackToken: 'xoxb-xxx',
    slackChannel: '#alerts',
  },
  Console: true,
};
```

## 🚀 使用方式

### 1. 工廠模式 (v3+ 推薦)

這種方式將配置初始化與標籤綁定分離，適合在大型多模組應用中共享同一個工廠，並在不同模組間獲取帶有標籤的 Logger。

```typescript
import { createLogger } from '@17live/node-logger';

// 1. 初始化工廠 (只需一次)
const loggerFactory = createLogger(loggerConfig);

// 2. 在不同模組建立帶有標籤的 Logger
const logger = loggerFactory('auth-module');
const dbLogger = loggerFactory('db-module');

await logger.info('用戶登入成功', { userId: 123 });
```

### 2. 直接模式 (向下相容 v2.x)

如果你正從 v2 升級，現有的呼叫方式依然完全有效，不需要任何程式碼異動。

```typescript
import { createLogger } from '@17live/node-logger';

// 直接傳入配置與標籤
const logger = createLogger(loggerConfig, 'legacy-module');

await logger.warn('舊有的呼叫方式依然運作順暢！');
```

## 📋 版本差異對照 (v2 vs v3)

| 特性 | v2.x (傳統) | v3.x (現代) | 說明 |
| :--- | :--- | :--- | :--- |
| **初始化方式** | `createLogger(conf, label)` | `createLogger(conf)(label)` | v3 支援工廠模式，重複使用率與效能更佳 |
| **配置結構** | 專案資訊位於頂層 | 建議放在 `base` 物件內 | v3 具備自動提取頂層配置的相容邏輯 |
| **傳回值** | Logger 實例 | Logger 工廠函數 | v3 會根據參數個數自動切換傳回類型 |
| **非同步狀態** | 回傳 `Promise<any>` | 回傳 `PromiseSettledResult[]` | v3 讓你精確掌握每個分發服務的發送結果 |
| **資料處理** | 僅支援基本物件 | 支援 Date, Map, Set, Error | v3 資料扁平化能力大幅強化 |

## 🛡 安全與穩定性
- **循環引用偵測**: 自動偵測並標記物件循環引用（標記為 `[Circular Reference]`），避免崩潰。
- **最大深度保護**: 預設扁平化限制為 10 層（可調整），防止處理過大物件導致效能受損。
- **逾時保護**: 單一服務發送超過 10 秒自動棄置，確保不因為單點故障阻塞主程式。

## 🛠 開發指南

### 開發標準
- **嚴格型別**: 嚴禁使用 `any`。請使用泛型或搭配類型守衛的 `unknown`。
- **測試要求**: 所有 Pull Request 必須維持 100% 的邏輯與分支覆蓋率。
- **Git Hooks**: Pre-commit 鉤子會自動執行 `eslint` 與 `tsc --noEmit`。若有任何語法或型別錯誤將無法提交。

### 常用指令
- `yarn test`: 執行所有單元測試並產出覆蓋率報告。
- `yarn lint`: 檢查並修復程式碼風格。
- `yarn build`: 手動觸發編譯（主要用於本地 `npm link` 測試）。

### 發佈流程
發佈流程透過 CircleCI 自動化執行。若要發佈新版本：
1. 在 PR 中更新 `package.json` 與 `CHANGELOG.md` 的版本號。
2. 將 PR 合併至 `master` 分支。
3. 建立並推送一個 Git Tag：
   ```bash
   git tag v3.0.x
   git push origin v3.0.x
   ```
4. CircleCI 會偵測到 Tag，自動執行測試、編譯，並發佈至 npm registry。
