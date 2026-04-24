import { LogLevel } from '../types';

const level = {
  OFF: LogLevel.OFF,
  FATAL: LogLevel.FATAL,
  ERROR: LogLevel.ERROR,
  WARN: LogLevel.WARN,
  INFO: LogLevel.INFO,
  DEBUG: LogLevel.DEBUG,
  ALL: LogLevel.ALL,
};

export default level;
