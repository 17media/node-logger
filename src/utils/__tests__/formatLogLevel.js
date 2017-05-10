import Level from '../../enum/level';
import { formatLogLevel } from '../';

describe('utils/formatLogLevel', () => {
  it('should format log levels correctly', () => {
    expect(formatLogLevel(Level.FATAL)).toBe('fatal');
    expect(formatLogLevel(Level.ERROR)).toBe('error');
    expect(formatLogLevel(Level.WARN)).toBe('warn');
    expect(formatLogLevel(Level.INFO)).toBe('info');
    expect(formatLogLevel(Level.DEBUG)).toBe('debug');
  });
});
