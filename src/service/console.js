/* eslint-disable no-console */
import Logger from './logger';
import { formatLogLevel } from '../utils';

class ConsoleLogger extends Logger {
  Log(level, message, label) {
    const { project } = this.config;

    console.log(`[${formatLogLevel(level)}]\n${project} - ${label}\n${message.toString()}`);
    return Promise.resolve();
  }
}

export default ConsoleLogger;
/* eslint-enable no-console */
