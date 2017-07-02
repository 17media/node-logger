declare module '@17media/node-logger' {

  type LoggerLevel = number;

  export namespace Level {
    export const ALL: LoggerLevel;
    export const DEBUG: LoggerLevel;
    export const INFO: LoggerLevel;
    export const WARN: LoggerLevel;
    export const ERROR: LoggerLevel;
    export const FATAL: LoggerLevel;
    export const OFF: LoggerLevel;
  }

  export interface LoggerConfig {
    base?: BaseLoggerConfig;
    Slack?: SlackLoggerConfig;
    Fluentd?: FluentdLoggerConfig;
    Console?: OptionalLoggerConfig;
  }

  export interface OptionalLoggerConfig {
    logLevel?: LoggerLevel;
  }

  export interface BaseLoggerConfig extends OptionalLoggerConfig {
    project: string;
    environment: string;
  }

  export interface SlackLoggerConfig extends OptionalLoggerConfig {
    slackToken: string;
    slackChannel;
  }

  export interface FluentdLoggerConfig extends OptionalLoggerConfig {
    collectorUrl: string;
  }

  export interface LoggerWrapper {
    (label: string): WrappedLogger;
  }

  export interface LevelLogger {
    (...args): void;
  }

  export interface WrappedLogger {
    (level: number): LevelLogger;
    fatal: LevelLogger;
    error: LevelLogger;
    warn: LevelLogger;
    info: LevelLogger;
    debug: LevelLogger;
    log: LevelLogger;
  }

  export function createLogger(config: LoggerConfig): LoggerWrapper;

  export default createLogger;

  export class Logger {
    constructor(config: LoggerConfig);
    Label(label: string): { Log: (level: number, message: string) => void };
    Log(level: number, message: string, label: string): Promise<void>;
  }

  class ChildLogger {
    constructor(config: BaseLoggerConfig);
    IsConfigValid(): boolean;
    ShouldLog(): boolean;
    Log(level: number, message: string, label: string): void;
  }

  export class Slack extends ChildLogger {
    Log(level: number, message: string, label: string): Promise<void>;
  }

  export class Fluentd extends ChildLogger {
    Log(level: number, message: string, label: string): Promise<void>;
  }

  export class LogMessage {
    constructor(message: string, fields: object);
    get(fieldName: string): any;
    toString(): string;
    toObject(): object;
  }

  export class ErrorMessage extends LogMessage {
    constructor(message: string, err: any, fields: object);
  }

}
