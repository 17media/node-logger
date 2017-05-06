import isError from 'lodash/isError';
import Logger from './logger';
import { LogMessage, ErrorMessage } from './message';
import methodAlias from './enum/methodAlias';

const createLogger = (config) => {
  const internalLogger = new Logger(config);

  return (label) => {
    const labelledLogger = internalLogger.Label(label);

    const logger = level => (...args) => {
      let msg;

      if (args.length === 1 && typeof args[0] === 'function' && args[0].prototype instanceof LogMessage) {
        // custom extended log message
        msg = args[0];
      } else if (args.find(isError)) {
        // error message
        msg = new ErrorMessage(...args);
      } else {
        // regular log message
        msg = new LogMessage(...args);
      }

      labelledLogger.Log(
        level,
        msg,
      );
    };

    methodAlias.forEach((method) => {
      logger[method] = logger(methodAlias[method]);
    });

    return logger;
  };
};

export default createLogger;
