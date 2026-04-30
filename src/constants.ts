import { LogLevel } from './enum/level';

/** 預設紀錄層級 */
export const DEFAULT_LOG_LEVEL = LogLevel.INFO;
/** flattenObject 的最大遞迴深度 */
export const DEFAULT_MAX_DEPTH = 10;
/** 單一日誌服務發送的逾時時間（毫秒） */
export const DEFAULT_TIMEOUT_MS = 10000;

/**
 * 取得環境變數中的 LOG_LEVEL 並轉換為 LogLevel Enum。
 * 支援不分大小寫的字串輸入（例如：DEBUG, info）。
 */
export const getEnvLogLevel = (envVal?: string): LogLevel | undefined => {
  if (!envVal) return undefined;

  const normalized = envVal.toUpperCase();
  const LevelMap: Record<string, LogLevel> = {
    ALL: LogLevel.ALL,
    DEBUG: LogLevel.DEBUG,
    INFO: LogLevel.INFO,
    WARN: LogLevel.WARN,
    ERROR: LogLevel.ERROR,
    FATAL: LogLevel.FATAL,
    OFF: LogLevel.OFF,
  };

  return LevelMap[normalized];
};
