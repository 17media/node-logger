export enum LogLevel {
  ALL = -1,
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
  OFF = 5,
}

export interface OptionalLoggerConfig {
  logLevel?: LogLevel;
}

export interface BaseLoggerConfig extends OptionalLoggerConfig {
  project: string;
  environment: string;
}

export interface SlackLoggerConfig extends BaseLoggerConfig {
  slackToken: string;
  slackChannel: string;
  options?: {
    fields?: {
      maxLine?: number;
      short?: boolean;
      excludes?: string[];
    };
    getFooter?: (fields: Record<string, any>, logTime: number) => string;
  };
}

export interface FluentdLoggerConfig extends BaseLoggerConfig {
  collectorUrl: string;
}

export interface LoggerConfig {
  base?: BaseLoggerConfig;
  Slack?: SlackLoggerConfig;
  Fluentd?: FluentdLoggerConfig;
  Console?: OptionalLoggerConfig | boolean;
}

export interface LogMessageInterface {
  toString(): string;
  toObject(): Record<string, any>;
  get(fieldName: string): any;
}

declare global {
  function deepFreeze<T extends object>(obj: T): T;
}
