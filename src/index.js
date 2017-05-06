import Logger from './logger';
import LOG_LEVEL from './enum/logLevel';
import * as messages from './message';
import methodAlias from './enum/methodAlias';

export {
  LOG_LEVEL,
  Logger,
};

export * from './service';
export * from './message';

export default (config) => {
  const internalLogger = new Logger(config);

  return (label) => {
    const labelledLogger = internalLogger.Label(label);

    const logger = level => (...args) => {
      let msg;

      if (args.length === 2) {
        msg = new messages.LogMessage(...args);
      } else {
        msg = new messages.ErrorMessage(...args);
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
