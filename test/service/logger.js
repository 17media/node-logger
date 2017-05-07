/* eslint-env node, mocha */
import { expect } from 'chai';
import Logger from '../../lib/service/logger';
import LOG_LEVEL from '../../lib/enum/logLevel';

describe('service/logger', () => {
  it('should construct logger and check configs', () => {
    const config = {
      project: 'cool project',
      environment: 'production',
      minLogLevel: LOG_LEVEL.ERROR,
    };

    const logger = new Logger(config);

    expect(logger.IsConfigValid()).to.equal(true);
  });

  it('should construct logger and detect invalid configs', () => {
    // missing 'project'
    const config = {
      environment: 'production',
      minLogLevel: LOG_LEVEL.ERROR,
    };

    const logger = new Logger(config);

    expect(logger.IsConfigValid()).to.equal(false);
  });

  it('should detemine if logger should log depending on the configs provided', () => {
    const config = {
      project: 'cool project',
      environment: 'production',
      minLogLevel: LOG_LEVEL.ERROR,
    };

    const logger = new Logger(config);

    expect(logger.ShouldLog(LOG_LEVEL.ERROR)).to.equal(true);
    expect(logger.ShouldLog(LOG_LEVEL.WARN)).to.equal(false);
    expect(logger.ShouldLog(LOG_LEVEL.INFO)).to.equal(false);
    expect(logger.ShouldLog(LOG_LEVEL.DEBUG)).to.equal(false);
  });

  it('should use default log level when log level is not provided in config', () => {
    // missing log level
    const config = {
      project: 'cool project',
      environment: 'production',
    };

    // should default to 'INFO'
    const logger = new Logger(config);

    expect(logger.IsConfigValid()).to.equal(true);
    expect(logger.ShouldLog(LOG_LEVEL.ERROR)).to.equal(true);
    expect(logger.ShouldLog(LOG_LEVEL.WARN)).to.equal(true);
    expect(logger.ShouldLog(LOG_LEVEL.INFO)).to.equal(true);
    expect(logger.ShouldLog(LOG_LEVEL.DEBUG)).to.equal(false);
  });
});
