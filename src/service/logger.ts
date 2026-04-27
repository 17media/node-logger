import { hasAllKeys } from '../utils';
import { LogMessageInterface, BaseLoggerConfig } from '../types';
import { LogLevel } from '../enum/level';

const requiredConfig = ['project', 'environment'];

const baseConfig = {
  // default minimum log level when it's not specified
  logLevel: LogLevel.INFO,
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
    return level >= (this.config.logLevel ?? LogLevel.INFO);
  }

  // this function must be implemented by individual service
  abstract Log(
    level: LogLevel,
    message: LogMessageInterface,
    label: string,
    logTime: number
  ): Promise<void>;
}

export default Logger;
