import Logger from '../logger';
import Level from '../../enum/level';

describe('service/logger', () => {
  it('should construct logger and check configs', () => {
    const config = {
      project: 'cool project',
      environment: 'production',
      logLevel: Level.ERROR,
    };

    const logger = new Logger(config);

    expect(logger.IsConfigValid()).toBe(true);
  });

  it('should construct logger and detect invalid configs', () => {
    // missing 'project'
    const config = {
      environment: 'production',
      logLevel: Level.ERROR,
    };

    const logger = new Logger(config);

    expect(logger.IsConfigValid()).toBe(false);
  });

  it('should detemine if logger should log depending on the configs provided', () => {
    const config = {
      project: 'cool project',
      environment: 'production',
      logLevel: Level.ERROR,
    };

    const logger = new Logger(config);

    expect(logger.ShouldLog(Level.FATAL)).toBe(true);
    expect(logger.ShouldLog(Level.ERROR)).toBe(true);
    expect(logger.ShouldLog(Level.WARN)).toBe(false);
    expect(logger.ShouldLog(Level.INFO)).toBe(false);
    expect(logger.ShouldLog(Level.DEBUG)).toBe(false);
  });

  it('should use default log level when log level is not provided in config', () => {
    // missing log level
    const config = {
      project: 'cool project',
      environment: 'production',
    };

    // should default to 'INFO'
    const logger = new Logger(config);

    expect(logger.IsConfigValid()).toBe(true);
    expect(logger.ShouldLog(Level.FATAL)).toBe(true);
    expect(logger.ShouldLog(Level.ERROR)).toBe(true);
    expect(logger.ShouldLog(Level.WARN)).toBe(true);
    expect(logger.ShouldLog(Level.INFO)).toBe(true);
    expect(logger.ShouldLog(Level.DEBUG)).toBe(false);
  });
});
