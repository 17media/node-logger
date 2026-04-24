import Logger from '../logger';
import Level from '../../enum/level';
import { LogLevel, LogMessageInterface } from '../../types';

// 建立一個具體類別用於測試抽象類別的基礎功能
class TestLogger extends Logger {
  async Log(level: LogLevel, message: LogMessageInterface, label: string, logTime: number): Promise<void> {
    // 測試用，不需實作
  }
}

describe('service/logger', () => {
  it('should construct logger and check configs', () => {
    const config = {
      project: 'cool project',
      environment: 'production',
      logLevel: Level.ERROR,
    };

    const logger = new TestLogger(config);

    expect(logger.IsConfigValid()).toBe(true);
  });

  it('should construct logger and detect invalid configs', () => {
    // missing 'project'
    const config = {
      environment: 'production',
      logLevel: Level.ERROR,
    };

    const logger = new TestLogger(config as any);

    expect(logger.IsConfigValid()).toBe(false);
  });

  it('should detemine if logger should log depending on the configs provided', () => {
    const config = {
      project: 'cool project',
      environment: 'production',
      logLevel: Level.ERROR,
    };

    const logger = new TestLogger(config);

    expect(logger.ShouldLog(Level.FATAL as LogLevel)).toBe(true);
    expect(logger.ShouldLog(Level.ERROR as LogLevel)).toBe(true);
    expect(logger.ShouldLog(Level.WARN as LogLevel)).toBe(false);
    expect(logger.ShouldLog(Level.INFO as LogLevel)).toBe(false);
    expect(logger.ShouldLog(Level.DEBUG as LogLevel)).toBe(false);
  });

  it('should use default log level when log level is not provided in config', () => {
    // missing log level
    const config = {
      project: 'cool project',
      environment: 'production',
    };

    // should default to 'INFO'
    const logger = new TestLogger(config);

    expect(logger.IsConfigValid()).toBe(true);
    expect(logger.ShouldLog(Level.FATAL as LogLevel)).toBe(true);
    expect(logger.ShouldLog(Level.ERROR as LogLevel)).toBe(true);
    expect(logger.ShouldLog(Level.WARN as LogLevel)).toBe(true);
    expect(logger.ShouldLog(Level.INFO as LogLevel)).toBe(true);
    expect(logger.ShouldLog(Level.DEBUG as LogLevel)).toBe(false);
  });

  it('should handle missing logLevel in config after construction', () => {
    const config = {
      project: 'cool project',
      environment: 'production',
    };
    const logger = new TestLogger(config);
    
    // 強制將 config 內的 logLevel 移除（模擬極端邊界）
    delete (logger as any).config.logLevel;

    // 此時 ShouldLog 應該會使用 Level.INFO 作為 fallback
    expect(logger.ShouldLog(Level.INFO as LogLevel)).toBe(true);
    expect(logger.ShouldLog(Level.DEBUG as LogLevel)).toBe(false);
  });
});
