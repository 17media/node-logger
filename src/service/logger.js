import LOG_LEVEL from '../enum/logLevel';
import { hasAllKeys } from '../utils';

const requiredConfig = [
  'project',
  'environment',
];

const baseConfig = {
  // default minimum log level when it's not specified
  minLogLevel: LOG_LEVEL.ERROR,
};

// abstract base class for different logging services
class Logger {
  constructor(config) {
    this.config = Object.assign({}, baseConfig, config);
  }

  IsConfigValid() {
    return hasAllKeys(this.config, requiredConfig);
  }

  ShouldLog(logLevel) {
    return logLevel >= this.config.minLogLevel;
  }

  // this function must be implemented by individual service
  // Log(logLevel, logMessage, label) {
  // }
}

export default Logger;
