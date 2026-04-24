import Logger from './logger';
import { isLogMessage } from './utils';
import { LogMessage, ErrorMessage } from './message';
import methodAlias from './enum/methodAlias';
import { LoggerConfig, LogLevel } from './types';

const createLogger = (config: LoggerConfig) => {
  const internalLogger = new Logger(config);

  return (label: string) => {
    const labelledLogger = internalLogger.Label(label);

    const logger = (level: LogLevel) => (...args: any[]) => {
      let message;

      if (args.length === 1 && isLogMessage(args[0])) {
        // custom extended log message
        message = args[0];
      } else if (args.some(arg => arg instanceof Error)) {
        // error message
        const error = args.find(arg => arg instanceof Error) as Error;
        const otherArgs = args.filter(arg => !(arg instanceof Error));
        // Note: original ErrorMessage logic takes (message, err, fields)
        message = new ErrorMessage(otherArgs[0] || error.message, error, otherArgs[1] || {});
      } else {
        // regular log message
        message = new LogMessage(args[0], args[1] || {});
      }

      return labelledLogger.Log(level, message);
    };

    const finalLogger: any = (level: LogLevel) => logger(level);

    (Object.keys(methodAlias) as Array<keyof typeof methodAlias>).forEach((method) => {
      finalLogger[method] = logger(methodAlias[method]);
    });

    return finalLogger;
  };
};

export default createLogger;
