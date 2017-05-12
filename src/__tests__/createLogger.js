import { LogMessage, ErrorMessage } from '../message';
import { Slack, Fluentd, Console } from '../service';
import Level from '../enum/level';
import Logger from '../logger';
import createLogger from '../createLogger';

describe('createLogger', () => {
  const message = 'something happened';
  const label = 'some:label';
  const config = {
    base: {
      logLevel: Level.INFO,
      project: 'cool project',
      environment: 'production',
    },
    Slack: {
      logLevel: Level.ERROR,
      slackToken: 'token',
      slackChannel: 'slack channel',
    },
    Console: true,
    Fluentd: {
      collectorUrl: 'collector URL',
    },
  };
  const originalLoggerLog = Logger.prototype.Log;

  beforeEach(() => {
    Logger.prototype.Log = jest.fn(() => Promise.resolve());
  });

  afterAll(() => {
    Logger.prototype.Log = originalLoggerLog;
  });

  it('should initiate logger and pass through configs', () => {
    const originalSlackConfigCheck = Slack.prototype.IsConfigValid;
    const originalFluentdConfigCheck = Fluentd.prototype.IsConfigValid;
    const originalConsoleConfigCheck = Console.prototype.IsConfigValid;
    Slack.prototype.IsConfigValid = jest.fn(originalSlackConfigCheck);
    Fluentd.prototype.IsConfigValid = jest.fn(originalFluentdConfigCheck);
    Console.prototype.IsConfigValid = jest.fn(originalConsoleConfigCheck);

    createLogger(config);

    expect(Slack.prototype.IsConfigValid).toHaveBeenCalledTimes(1);
    expect(Fluentd.prototype.IsConfigValid).toHaveBeenCalledTimes(1);
    expect(Console.prototype.IsConfigValid).toHaveBeenCalledTimes(1);

    Slack.prototype.IsConfigValid = originalSlackConfigCheck;
    Fluentd.prototype.IsConfigValid = originalFluentdConfigCheck;
    Console.prototype.IsConfigValid = originalConsoleConfigCheck;
  });

  it('should wait for logger to finish in promise', (done) => {
    // delay log services
    const delay = new Promise(resolve => setTimeout(resolve, 1000));
    const logFinished = jest.fn(() => Promise.resolve());
    Logger.prototype.Log = jest.fn(() => delay.then(logFinished));
    const logMessage = new LogMessage(message);

    createLogger(config)(label)(Level.INFO)(logMessage)
      .then(() => {
        expect(Logger.prototype.Log).toHaveBeenCalledTimes(1);
        expect(Logger.prototype.Log).toHaveBeenCalledWith(Level.INFO, logMessage, label);
        expect(logFinished).toHaveBeenCalledTimes(1);
        done();
      });
  });

  it('should preset label for future logs', () => {
    const logMessage = new LogMessage(message);

    createLogger(config)(label)(Level.INFO)(logMessage);

    expect(Logger.prototype.Log).toHaveBeenCalledTimes(1);
    expect(Logger.prototype.Log).toHaveBeenCalledWith(Level.INFO, logMessage, label);
  });

  it('should create log message implicitly (message)', () => {
    const logMessage = new LogMessage(message);

    createLogger(config)(label).debug(message);

    expect(Logger.prototype.Log).toHaveBeenCalledTimes(1);
    expect(Logger.prototype.Log).toHaveBeenCalledWith(Level.DEBUG, logMessage, label);
  });

  it('should create log message implicitly (message + info)', () => {
    const additionalInfo = { key: 'value' };
    const logMessage = new LogMessage(message, additionalInfo);

    createLogger(config)(label).debug(message, additionalInfo);

    expect(Logger.prototype.Log).toHaveBeenCalledTimes(1);
    expect(Logger.prototype.Log).toHaveBeenCalledWith(Level.DEBUG, logMessage, label);
  });

  it('should create error message implicitly (message + error)', () => {
    const error = new Error(message);
    const errorMessage = new ErrorMessage(message, error);

    createLogger(config)(label).debug(message, error);

    expect(Logger.prototype.Log).toHaveBeenCalledTimes(1);
    expect(Logger.prototype.Log).toHaveBeenCalledWith(Level.DEBUG, errorMessage, label);
  });

  it('should create error message implicitly (message + error + info)', () => {
    const error = new Error(message);
    const additionalInfo = { key: 'value' };
    const errorMessage = new ErrorMessage(message, error, additionalInfo);

    createLogger(config)(label).debug(message, error, additionalInfo);

    expect(Logger.prototype.Log).toHaveBeenCalledTimes(1);
    expect(Logger.prototype.Log).toHaveBeenCalledWith(Level.DEBUG, errorMessage, label);
  });

  describe('method alias', () => {
    const logMessage = new LogMessage(message);

    it('should log with FATAL when .fatal() is called', () => {
      createLogger(config)(label).fatal(logMessage);

      expect(Logger.prototype.Log).toHaveBeenCalledTimes(1);
      expect(Logger.prototype.Log).toHaveBeenCalledWith(Level.FATAL, logMessage, label);
    });

    it('should log with ERROR when .error() is called', () => {
      createLogger(config)(label).error(logMessage);

      expect(Logger.prototype.Log).toHaveBeenCalledTimes(1);
      expect(Logger.prototype.Log).toHaveBeenCalledWith(Level.ERROR, logMessage, label);
    });

    it('should log with WARN when .warn() is called', () => {
      createLogger(config)(label).warn(logMessage);

      expect(Logger.prototype.Log).toHaveBeenCalledTimes(1);
      expect(Logger.prototype.Log).toHaveBeenCalledWith(Level.WARN, logMessage, label);
    });

    it('should log with INFO when .info() is called', () => {
      createLogger(config)(label).info(logMessage);

      expect(Logger.prototype.Log).toHaveBeenCalledTimes(1);
      expect(Logger.prototype.Log).toHaveBeenCalledWith(Level.INFO, logMessage, label);
    });

    it('should log with DEBUG when .debug() is called', () => {
      createLogger(config)(label).debug(logMessage);

      expect(Logger.prototype.Log).toHaveBeenCalledTimes(1);
      expect(Logger.prototype.Log).toHaveBeenCalledWith(Level.DEBUG, logMessage, label);
    });
  });
});
