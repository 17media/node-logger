import { LogMessage } from '../message';
import { Slack, Fluentd, Console } from '../service';
import Level from '../enum/level';
import Logger from '../logger';

describe('logger', () => {
  describe('config', () => {
    it('should accept object', () => {
      expect(() => new Logger({ key: 'value' })).not.toThrow('invalid config');
    });

    it('should not accept string', () => {
      expect(() => new Logger('not object')).toThrow('invalid config');
    });

    it('should not accept integer', () => {
      expect(() => new Logger(1)).toThrow('invalid config');
    });

    it('should not accept null', () => {
      expect(() => new Logger(null)).toThrow('invalid config');
    });

    it('should not accept array', () => {
      expect(() => new Logger([3, 4, 5])).toThrow('invalid config');
    });

    it('should initiate proper services according to config', () => {
      const originalSlackConfigCheck = Slack.prototype.IsConfigValid;
      const originalFluentdConfigCheck = Fluentd.prototype.IsConfigValid;
      const originalConsoleConfigCheck = Console.prototype.IsConfigValid;
      Slack.prototype.IsConfigValid = jest.fn(originalSlackConfigCheck);
      Fluentd.prototype.IsConfigValid = jest.fn(originalFluentdConfigCheck);
      Console.prototype.IsConfigValid = jest.fn(originalConsoleConfigCheck);

      const config = {
        base: {
          project: 'cool project',
          environment: 'production',
        },
        Slack: {
          logLevel: Level.DEBUG,
          slackToken: 'token',
          slackChannel: 'slack channel',
        },
        // disable console logger
        Console: false,
        // fluentd logger config is missing
      };

      const logger = new Logger(config);

      expect(logger.services).toHaveLength(1);
      expect(logger.services[0]).toBeInstanceOf(Slack);
      expect(logger.services[0].config).toEqual(
        Object.assign({}, config.base, config.Slack)
      );
      expect(Slack.prototype.IsConfigValid).toHaveBeenCalledTimes(1);
      expect(Fluentd.prototype.IsConfigValid).not.toHaveBeenCalled();
      expect(Console.prototype.IsConfigValid).not.toHaveBeenCalled();

      Slack.prototype.IsConfigValid = originalSlackConfigCheck;
      Fluentd.prototype.IsConfigValid = originalFluentdConfigCheck;
      Console.prototype.IsConfigValid = originalConsoleConfigCheck;
    });
  });

  describe('logging', () => {
    const message = 'something happened';
    const label = 'some:label';
    const originalSlackLog = Slack.prototype.Log;
    const originalFluentdLog = Fluentd.prototype.Log;
    const originalConsoleLog = Console.prototype.Log;
    let config;

    beforeEach(() => {
      Slack.prototype.Log = jest.fn(() => Promise.resolve());
      Fluentd.prototype.Log = jest.fn(() => Promise.resolve());
      Console.prototype.Log = jest.fn(() => Promise.resolve());

      config = {
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
    });

    afterAll(() => {
      Slack.prototype.Log = originalSlackLog;
      Fluentd.prototype.Log = originalFluentdLog;
      Console.prototype.Log = originalConsoleLog;
    });

    it('should call each service and pass through message', () => {
      const logger = new Logger(config);

      logger.Log(Level.ERROR, new LogMessage(message), label);

      expect(logger.services).toHaveLength(3);
      expect(Slack.prototype.Log).toHaveBeenCalledTimes(1);
      expect(Slack.prototype.Log).toHaveBeenCalledWith(Level.ERROR, new LogMessage(message), label);
      expect(Fluentd.prototype.Log).toHaveBeenCalledTimes(1);
      expect(Fluentd.prototype.Log).toHaveBeenCalledWith(Level.ERROR, new LogMessage(message), label);
      expect(Console.prototype.Log).toHaveBeenCalledTimes(1);
      expect(Console.prototype.Log).toHaveBeenCalledWith(Level.ERROR, new LogMessage(message), label);
    });

    it('should skip services with incomplete config', () => {
      const originalSlackConfigCheck = Slack.prototype.IsConfigValid;
      Slack.prototype.IsConfigValid = jest.fn(() => false);

      const logger = new Logger(config);

      logger.Log(Level.ERROR, new LogMessage(message), label);

      expect(logger.services).toHaveLength(2);
      expect(Slack.prototype.Log).not.toHaveBeenCalled();
      expect(Fluentd.prototype.Log).toHaveBeenCalledTimes(1);
      expect(Fluentd.prototype.Log).toHaveBeenCalledWith(Level.ERROR, new LogMessage(message), label);
      expect(Console.prototype.Log).toHaveBeenCalledTimes(1);
      expect(Console.prototype.Log).toHaveBeenCalledWith(Level.ERROR, new LogMessage(message), label);

      Slack.prototype.IsConfigValid = originalSlackConfigCheck;
    });

    it('should partially disable some services depending on log level', () => {
      const logger = new Logger(config);

      logger.Log(Level.WARN, new LogMessage(message), label);

      expect(logger.services).toHaveLength(3);
      expect(Slack.prototype.Log).not.toHaveBeenCalled();
      expect(Fluentd.prototype.Log).toHaveBeenCalledTimes(1);
      expect(Fluentd.prototype.Log).toHaveBeenCalledWith(Level.WARN, new LogMessage(message), label);
      expect(Console.prototype.Log).toHaveBeenCalledTimes(1);
      expect(Console.prototype.Log).toHaveBeenCalledWith(Level.WARN, new LogMessage(message), label);
    });

    it('should be able to preset label and pass through message', () => {
      const logger = new Logger(config).Label(label);

      logger.Log(Level.WARN, new LogMessage(message));

      expect(Slack.prototype.Log).not.toHaveBeenCalled();
      expect(Fluentd.prototype.Log).toHaveBeenCalledTimes(1);
      expect(Fluentd.prototype.Log).toHaveBeenCalledWith(Level.WARN, new LogMessage(message), label);
      expect(Console.prototype.Log).toHaveBeenCalledTimes(1);
      expect(Console.prototype.Log).toHaveBeenCalledWith(Level.WARN, new LogMessage(message), label);
    });
  });
});
