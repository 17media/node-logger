import * as services from '../service';
import Level from '../enum/level';
import { LogLevel } from '../types';

describe('logger with process.env override', () => {
  let Logger: any;

  beforeAll(() => {
    process.env.LOG_LEVEL = 'WARN';
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Logger = require('../logger').default;
  });

  afterAll(() => {
    delete process.env.LOG_LEVEL;
  });

  it('should use LOG_LEVEL defined in process.env', () => {
    const config = {
      base: {
        logLevel: Level.INFO,
        project: 'cool project',
        environment: 'production',
        options: {},
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

    const logger = new Logger(config);

    expect(logger.services).toHaveLength(3);
    logger.services.forEach((service: any) => {
      (['Slack', 'Fluentd', 'Console'] as const).forEach((serviceName) => {
        if (service instanceof (services as any)[serviceName]) {
          expect(service.config).toEqual(
            Object.assign({}, config.base, (config as any)[serviceName] === true ? {} : (config as any)[serviceName], { logLevel: Level.WARN })
          );
        }
      });
    });
  });
});
