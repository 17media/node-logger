import Logger from './logger';
import { isLogMessage } from './utils';
import { LogMessage, ErrorMessage } from './message';
import { LogLevel } from './enum/level';
import { LoggerConfig } from './types';

interface LevelLogger {
  (...args: unknown[]): Promise<any>;
}

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
 * @returns 一個接收 label 並回傳 WrappedLogger 的函數。
 */
const createLogger = (config: LoggerConfig) => {
  const internalLogger = new Logger(config);

  return (label: string): WrappedLogger => {
    const labelledLogger = internalLogger.Label(label);

    const logger =
      (level: LogLevel): LevelLogger =>
      (...args: unknown[]) => {
        let message;

        if (args.length === 1 && isLogMessage(args[0])) {
          // custom extended log message
          message = args[0];
        } else if (args.some(arg => arg instanceof Error)) {
          // error message
          const error = args.find(arg => arg instanceof Error) as Error;
          const otherArgs = args.filter(
            arg => !(arg instanceof Error)
          ) as any[];
          // Note: original ErrorMessage logic takes (message, err, fields)
          message = new ErrorMessage(
            otherArgs[0] || error.message,
            error,
            otherArgs[1] || {}
          );
        } else {
          // regular log message
          message = new LogMessage(
            args[0] as string,
            (args[1] || {}) as Record<string, any>
          );
        }

        return labelledLogger.Log(level, message);
      };

    // 靜態定義 WrappedLogger，取代原本的動態掛載
    const finalLogger: WrappedLogger = Object.assign(
      (level: LogLevel) => logger(level),
      {
        fatal: logger(LogLevel.FATAL),
        error: logger(LogLevel.ERROR),
        warn: logger(LogLevel.WARN),
        info: logger(LogLevel.INFO),
        debug: logger(LogLevel.DEBUG),
        log: logger(LogLevel.INFO), // Alias for info
      }
    );

    return finalLogger;
  };
};

export default createLogger;
