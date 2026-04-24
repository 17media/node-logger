import Level from '../enum/level';
import { hasAllKeys } from '../utils';
import { LogLevel, LogMessageInterface, BaseLoggerConfig } from '../types';

const requiredConfig = [
  'project',
  'environment',
];

const baseConfig = {
  // default minimum log level when it's not specified
  logLevel: Level.INFO,
};

// abstract base class for different logging services
abstract class Logger<T extends BaseLoggerConfig = BaseLoggerConfig> {
  protected config: T;

  constructor(config: T) {
    this.config = Object.assign({}, baseConfig, config) as T;
  }

  IsConfigValid(): boolean {
    return hasAllKeys(this.config, requiredConfig);
  }

  ShouldLog(level: LogLevel): boolean {
    return level >= (this.config.logLevel ?? Level.INFO);
  }

  // this function must be implemented by individual service
  abstract Log(level: LogLevel, message: LogMessageInterface, label: string, logTime: number): Promise<void>;
}

export default Logger;
