import Logger from './logger';
import { formatLogLevel } from '../utils';

class ConsoleLogger extends Logger {
  Log(logLevel, logMessage, label) {
    const { project } = this.config;

    console.log(`[${formatLogLevel(logLevel)}]\n${project} - ${label}\n${logMessage.toString()}`);
    return Promise.resolve();
  }
};

export default ConsoleLogger;
