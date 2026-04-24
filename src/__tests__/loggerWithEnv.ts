import * as services from '../service';
import Level from '../enum/level';

describe('logger with process.env override', () => {
  let Logger;

  beforeAll(() => {
    process.env.LOG_LEVEL = 'WARN';
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
    logger.services.forEach((service) => {
      ['Slack', 'Fluentd', 'Console'].forEach((serviceName) => {
        if (service instanceof services[serviceName]) {
          expect(service.config).toEqual(
            Object.assign({}, config.base, config[serviceName], { logLevel: Level.WARN })
          );
        }
      });
    });
  });
});
