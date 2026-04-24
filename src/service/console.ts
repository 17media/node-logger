import Logger from './logger';
import { formatLogLevel } from '../utils';
import Level from '../enum/level';
import { LogLevel, LogMessageInterface } from '../types';

class ConsoleLogger extends Logger {
  async Log(level: LogLevel, message: LogMessageInterface, label: string): Promise<void> {
    const { project } = this.config;
    const logOutput = `[${formatLogLevel(level).toUpperCase()}]\n${project} - ${label}\n${message.toString()}`;

    if (level >= Level.ERROR) {
      console.error(logOutput);
    } else if (level === Level.WARN) {
      console.warn(logOutput);
    } else {
      console.log(logOutput);
    }
  }
}

export default ConsoleLogger;
