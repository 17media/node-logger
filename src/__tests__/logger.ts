import { LogMessage } from '../message';
import { Slack, Fluentd, Console } from '../service';
import Level from '../enum/level';
import Logger from '../logger';
import { LogLevel } from '../types';

describe('logger', () => {
  describe('config', () => {
    it('should accept object', () => {
      expect(() => new Logger({ key: 'value' } as any)).not.toThrow('invalid config');
    });

    it('should not accept string', () => {
      expect(() => new Logger('not object' as any)).toThrow('invalid config');
    });

    it('should not accept integer', () => {
      expect(() => new Logger(1 as any)).toThrow('invalid config');
    });

    it('should not accept null', () => {
      expect(() => new Logger(null as any)).toThrow('invalid config');
    });

    it('should not accept array', () => {
      expect(() => new Logger([3, 4, 5] as any)).toThrow('invalid config');
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
          options: {},
        },
        Slack: {
          logLevel: Level.DEBUG,
          slackToken: 'token',
          slackChannel: 'slack channel',
        },
        Console: false,
      };

      const logger = new Logger(config as any);

      expect(logger.services).toHaveLength(1);
      expect(logger.services[0]).toBeInstanceOf(Slack);
      expect((logger.services[0] as any).config).toEqual(
        Object.assign({}, { logLevel: Level.INFO }, config.base, config.Slack)
      );
      expect(Slack.prototype.IsConfigValid).toHaveBeenCalledTimes(1);

      Slack.prototype.IsConfigValid = originalSlackConfigCheck;
      Fluentd.prototype.IsConfigValid = originalFluentdConfigCheck;
      Console.prototype.IsConfigValid = originalConsoleConfigCheck;
    });
  });

  describe('logging', () => {
    const message = 'something happened';
    const label = 'some:label';
    const logTime = Date.now();
    const originalSlackLog = Slack.prototype.Log;
    const originalFluentdLog = Fluentd.prototype.Log;
    const originalConsoleLog = Console.prototype.Log;
    let config: any;

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

      jest.spyOn(global, 'Date').mockImplementation(() => ({
        getTime: () => logTime,
      } as any));
    });

    afterAll(() => {
      Slack.prototype.Log = originalSlackLog;
      Fluentd.prototype.Log = originalFluentdLog;
      Console.prototype.Log = originalConsoleLog;
      jest.restoreAllMocks();
    });

    it('should call each service and pass through message', async () => {
      const logger = new Logger(config);
      await logger.Log(Level.ERROR as LogLevel, new LogMessage(message), label);

      expect(logger.services).toHaveLength(3);
      expect(Slack.prototype.Log).toHaveBeenCalledTimes(1);
      expect(Slack.prototype.Log).toHaveBeenCalledWith(Level.ERROR, new LogMessage(message), label, logTime);
      expect(Fluentd.prototype.Log).toHaveBeenCalledTimes(1);
      expect(Fluentd.prototype.Log).toHaveBeenCalledWith(Level.ERROR, new LogMessage(message), label, logTime);
      expect(Console.prototype.Log).toHaveBeenCalledTimes(1);
      expect(Console.prototype.Log).toHaveBeenCalledWith(Level.ERROR, new LogMessage(message), label, logTime);
    });

    it('should skip services with incomplete config', async () => {
      const originalSlackConfigCheck = Slack.prototype.IsConfigValid;
      Slack.prototype.IsConfigValid = jest.fn(() => false);

      const logger = new Logger(config);
      await logger.Log(Level.ERROR as LogLevel, new LogMessage(message), label);

      expect(logger.services).toHaveLength(2);
      expect(Slack.prototype.Log).not.toHaveBeenCalled();
      expect(Fluentd.prototype.Log).toHaveBeenCalledTimes(1);
      expect(Console.prototype.Log).toHaveBeenCalledTimes(1);

      Slack.prototype.IsConfigValid = originalSlackConfigCheck;
    });

    it('should wait for logger to finish', async () => {
      const logFinished = jest.fn(() => Promise.resolve());
      Slack.prototype.Log = jest.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return logFinished();
      });
      Fluentd.prototype.Log = jest.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return logFinished();
      });

      const logger = new Logger(config).Label(label);
      await logger.Log(Level.ERROR as LogLevel, new LogMessage(message));

      expect(Fluentd.prototype.Log).toHaveBeenCalledTimes(1);
      expect(logFinished).toHaveBeenCalledTimes(2);
    });

    it('should not expose internal service errors', async () => {
      Slack.prototype.Log = jest.fn(() => Promise.reject(new Error('Slack Fail')));
      Fluentd.prototype.Log = jest.fn(() => Promise.reject(new Error('Fluentd Fail')));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const logger = new Logger(config).Label(label);
      // Should resolve normally
      await logger.Log(Level.ERROR as LogLevel, new LogMessage(message));
      
      expect(Fluentd.prototype.Log).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[MasterLogger] Service "SlackLogger" failed to log:'), expect.any(Error));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[MasterLogger] Service "FluentdLogger" failed to log:'), expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should handle service failure even if service name is missing', async () => {
      const logger = new Logger(config);
      // 手動注入一個匿名物件作為服務，模擬極端情況
      const anonymousService = {
        ShouldLog: () => true,
        Log: () => Promise.reject(new Error('Anonymous Fail')),
        IsConfigValid: () => true,
      };
      
      // Override constructor to test the 'Service' fallback
      Object.defineProperty(anonymousService, 'constructor', { value: { name: '' } });

      logger.services.push(anonymousService as any);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await logger.Log(Level.ERROR as LogLevel, new LogMessage(message));

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[MasterLogger] Service "Service" failed to log:'), expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should timeout if service takes too long', async () => {
      jest.useFakeTimers();
      const logger = new Logger(config);
      
      // 模擬一個永遠不會結束的服務
      Slack.prototype.Log = jest.fn(() => new Promise(() => {}));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const logPromise = logger.Log(Level.ERROR as LogLevel, new LogMessage(message), label);
      
      // 快轉時間
      jest.advanceTimersByTime(11000);
      
      await logPromise;

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[MasterLogger] Service "SlackLogger" failed to log:'),
        expect.objectContaining({ message: expect.stringContaining('Logging timeout') })
      );
      
      consoleSpy.mockRestore();
      jest.useRealTimers();
    });
  });
});
