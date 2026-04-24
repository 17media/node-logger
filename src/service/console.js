import Logger from './logger';
import { formatLogLevel } from '../utils';
import Level from '../enum/level';

class ConsoleLogger extends Logger {
  async Log(level, message, label) {
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
