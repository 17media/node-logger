/* eslint-env node, mocha */
import { expect } from 'chai';
import Logger from '../../lib/service/logger';
import Level from '../../lib/enum/level';

describe('service/logger', () => {
  it('should construct logger and check configs', () => {
    const config = {
      project: 'cool project',
      environment: 'production',
      logLevel: Level.ERROR,
    };

    const logger = new Logger(config);

    expect(logger.IsConfigValid()).to.equal(true);
  });

  it('should construct logger and detect invalid configs', () => {
    // missing 'project'
    const config = {
      environment: 'production',
      logLevel: Level.ERROR,
    };

    const logger = new Logger(config);

    expect(logger.IsConfigValid()).to.equal(false);
  });

  it('should detemine if logger should log depending on the configs provided', () => {
    const config = {
      project: 'cool project',
      environment: 'production',
      logLevel: Level.ERROR,
    };

    const logger = new Logger(config);

    expect(logger.ShouldLog(Level.FATAL)).to.equal(true);
    expect(logger.ShouldLog(Level.ERROR)).to.equal(true);
    expect(logger.ShouldLog(Level.WARN)).to.equal(false);
    expect(logger.ShouldLog(Level.INFO)).to.equal(false);
    expect(logger.ShouldLog(Level.DEBUG)).to.equal(false);
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
    expect(logger.ShouldLog(Level.FATAL)).to.equal(true);
    expect(logger.ShouldLog(Level.ERROR)).to.equal(true);
    expect(logger.ShouldLog(Level.WARN)).to.equal(true);
    expect(logger.ShouldLog(Level.INFO)).to.equal(true);
    expect(logger.ShouldLog(Level.DEBUG)).to.equal(false);
  });
});
