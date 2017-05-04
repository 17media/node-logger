import LOG_LEVEL from '../enum/logLevel';

// abstract base class for different logging services
class Logger {
  constructor(config) {
    this.minLogLevel = config.minLogLevel || LOG_LEVEL.ERROR;
  }

  // this function must be implemented by individual service
  Log(logLevel, logMessage, label) {
    throw new Error('not implemented');
  }
}

module.exports = Logger;
