import Logger from './logger';
import { isLogMessage } from './utils';
import { LogMessage, ErrorMessage } from './message';
import methodAlias from './enum/methodAlias';
import { LoggerConfig, LogLevel } from './types';

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

const createLogger = (config: LoggerConfig) => {
  const internalLogger = new Logger(config);

  return (label: string): WrappedLogger => {
    const labelledLogger = internalLogger.Label(label);

    const logger = (level: LogLevel): LevelLogger => (...args: unknown[]) => {
      let message;

      if (args.length === 1 && isLogMessage(args[0])) {
        // custom extended log message
        message = args[0];
      } else if (args.some(arg => arg instanceof Error)) {
        // error message
        const error = args.find(arg => arg instanceof Error) as Error;
        const otherArgs = args.filter(arg => !(arg instanceof Error)) as any[];
        // Note: original ErrorMessage logic takes (message, err, fields)
        message = new ErrorMessage(otherArgs[0] || error.message, error, otherArgs[1] || {});
      } else {
        // regular log message
        message = new LogMessage(args[0] as string, (args[1] || {}) as Record<string, any>);
      }

      return labelledLogger.Log(level, message);
    };

    const finalLogger = ((level: LogLevel) => logger(level)) as WrappedLogger;

    (Object.keys(methodAlias) as Array<keyof typeof methodAlias>).forEach((method) => {
      finalLogger[method] = logger(methodAlias[method]);
    });

    return finalLogger;
  };
};

export default createLogger;
