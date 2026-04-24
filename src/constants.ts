import { LogLevel } from './types';

export const DEFAULT_LOG_LEVEL = LogLevel.INFO;
export const DEFAULT_MAX_DEPTH = 10;
export const DEFAULT_TIMEOUT_MS = 10000;

/**
 * 取得環境變數中的 LOG_LEVEL 並轉換為 LogLevel Enum
 */
export const getEnvLogLevel = (envVal?: string): LogLevel | undefined => {
  if (!envVal) return undefined;
  
  const normalized = envVal.toUpperCase();
  const LevelMap: Record<string, LogLevel> = {
    'ALL': LogLevel.ALL,
    'DEBUG': LogLevel.DEBUG,
    'INFO': LogLevel.INFO,
    'WARN': LogLevel.WARN,
    'ERROR': LogLevel.ERROR,
    'FATAL': LogLevel.FATAL,
    'OFF': LogLevel.OFF,
  };
  
  return LevelMap[normalized];
};
