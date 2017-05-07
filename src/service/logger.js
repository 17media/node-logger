import Level from '../enum/level';
import { hasAllKeys } from '../utils';

const requiredConfig = [
  'project',
  'environment',
];

const baseConfig = {
  // default minimum log level when it's not specified
  logLevel: Level.INFO,
};

// abstract base class for different logging services
class Logger {
  constructor(config) {
    this.config = Object.assign({}, baseConfig, config);
  }

  IsConfigValid() {
    return hasAllKeys(this.config, requiredConfig);
  }

  ShouldLog(level) {
    return level >= this.config.logLevel;
  }

  // this function must be implemented by individual service
  /* eslint-disable */
  Log(level, message, label) {
    throw new Error('not implemented');
  }
  /* eslint-enable */
}

export default Logger;
