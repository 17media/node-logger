import { LogLevel } from '../../enum/level';
import { formatLogLevel } from '../';

describe('utils/formatLogLevel', () => {
  it('should format log levels correctly', () => {
    expect(formatLogLevel(LogLevel.FATAL)).toBe('fatal');
    expect(formatLogLevel(LogLevel.ERROR)).toBe('error');
    expect(formatLogLevel(LogLevel.WARN)).toBe('warn');
    expect(formatLogLevel(LogLevel.INFO)).toBe('info');
    expect(formatLogLevel(LogLevel.DEBUG)).toBe('debug');
  });
});
