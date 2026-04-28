import Logger from './logger';
import { isLogMessage } from './utils';
import { LogMessage, ErrorMessage } from './message';
import { LogLevel } from './enum/level';
import { LoggerConfig, LogMessageInterface } from './types';

// 單一 Log 方法的型別定義
interface LevelLogger {
  (...args: unknown[]): Promise<PromiseSettledResult<void>[]>;
}

/**
 * 封裝後的 Logger 物件介面，支援快捷方法如 .info(), .error()
 */
interface WrappedLogger {
  (level: LogLevel): LevelLogger;
  fatal: LevelLogger;
  error: LevelLogger;
  warn: LevelLogger;
  info: LevelLogger;
  debug: LevelLogger;
  log: LevelLogger;
}

/**
 * 建立一個 Logger 工廠函數。
 * @param config Logger 配置物件，包含 Slack, Fluentd, Console 等服務的設定。
 * @returns 一個接收標籤 (label) 並回傳 WrappedLogger 的函數。
 */
const createLogger = (config: LoggerConfig) => {
  const internalLogger = new Logger(config);

  return (label: string): WrappedLogger => {
    const labelledLogger = internalLogger.Label(label);

    const logger =
      (level: LogLevel): LevelLogger =>
      (...args: unknown[]) => {
        let message: LogMessageInterface;

        // 參數解析邏輯
        if (args.length === 1 && isLogMessage(args[0])) {
          // 情況 A: 直接傳入已建立好的 LogMessage 實例
          message = args[0];
        } else if (args.some(arg => arg instanceof Error)) {
          // 情況 B: 參數中包含 Error 物件
          const error = args.find(arg => arg instanceof Error) as Error;
          const remainingArgs = args.filter(arg => arg !== error);
          
          let msgStr = '';
          let fields = {};

          if (typeof remainingArgs[0] === 'string') {
            msgStr = remainingArgs[0];
            fields = remainingArgs[1] || {};
          } else {
            msgStr = error.message;
            fields = remainingArgs[0] || {};
          }

          message = new ErrorMessage(msgStr, error, fields as Record<string, any>);
        } else if (typeof args[0] === 'string') {
          // 情況 C: 標準用法 (字串訊息, metadata 物件)
          message = new LogMessage(
            args[0],
            (args[1] || {}) as Record<string, any>
          );
        } else if (args[0] && typeof args[0] === 'object') {
          // 情況 D: 僅傳入 metadata 物件 (無字串訊息)
          message = new LogMessage('', args[0] as Record<string, any>);
        } else {
          // 預設後備方案：將第一個參數強制轉為字串
          message = new LogMessage(args[0] as any, {});
        }

        return labelledLogger.Log(level, message);
      };

    // 靜態定義 WrappedLogger 的快捷方法
    const finalLogger: WrappedLogger = Object.assign(
      (level: LogLevel) => logger(level),
      {
        fatal: logger(LogLevel.FATAL),
        error: logger(LogLevel.ERROR),
        warn: logger(LogLevel.WARN),
        info: logger(LogLevel.INFO),
        debug: logger(LogLevel.DEBUG),
        log: logger(LogLevel.INFO), // log 預設對應到 info 層級
      }
    );

    return finalLogger;
  };
};

export default createLogger;
