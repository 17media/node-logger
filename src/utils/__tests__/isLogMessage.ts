import { isLogMessage } from '../';

describe('utils/isLogMessage', () => {
  it('should return false for null or undefined', () => {
    expect(isLogMessage(null)).toBe(false);
    expect(isLogMessage(undefined)).toBe(false);
  });

  it('should return false for non-objects', () => {
    expect(isLogMessage('string')).toBe(false);
    expect(isLogMessage(123)).toBe(false);
  });

  it('should return false for objects missing methods', () => {
    expect(isLogMessage({})).toBe(false);
    expect(isLogMessage({ toString: () => '' })).toBe(false);
    expect(isLogMessage({ toString: () => '', toObject: () => ({}) })).toBe(false);
  });

  it('should return true for valid LogMessage objects', () => {
    const mockMsg = {
      toString: () => '',
      toObject: () => ({}),
      get: () => ''
    };
    expect(isLogMessage(mockMsg)).toBe(true);
  });
});
