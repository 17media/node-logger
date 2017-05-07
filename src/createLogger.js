import isError from 'lodash/isError';
import Logger from './logger';
import { isLogMessage } from './utils';
import { LogMessage, ErrorMessage } from './message';
import methodAlias from './enum/methodAlias';

const createLogger = (config) => {
  const internalLogger = new Logger(config);

  return (label) => {
    const labelledLogger = internalLogger.Label(label);

    const logger = level => (...args) => {
      let msg;

      if (args.length === 1 && isLogMessage(args[0])) {
        // custom extended log message
        msg = args[0];
      } else if (args.find(isError)) {
        // error message
        msg = new ErrorMessage(...args);
      } else {
        // regular log message
        msg = new LogMessage(...args);
      }

      labelledLogger.Log(level, msg);
    };

    Object.keys(methodAlias).forEach((method) => {
      logger[method] = logger(methodAlias[method]);
    });

    return logger;
  };
};

export default createLogger;
