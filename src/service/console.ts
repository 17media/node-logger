import Logger from './logger';
import { formatLogLevel } from '../utils';
import { LogLevel } from '../enum/level';
import { LogMessageInterface } from '../types';

class ConsoleLogger extends Logger {
  async Log(
    level: LogLevel,
    message: LogMessageInterface,
    label: string
  ): Promise<void> {
    const { project } = this.config;
    const logOutput = `[${formatLogLevel(level).toUpperCase()}]\n${project} - ${label}\n${message.toString()}`;

    if (level >= LogLevel.ERROR) {
      console.error(logOutput);
    } else if (level === LogLevel.WARN) {
      console.warn(logOutput);
    } else {
      console.log(logOutput);
    }
  }
}

export default ConsoleLogger;
