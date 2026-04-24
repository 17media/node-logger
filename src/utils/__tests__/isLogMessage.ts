import { LogMessage, ErrorMessage } from '../../message';
import { isLogMessage } from '../';

describe('utils/isLogMessage', () => {
  it('should return true for LogMessage and ErrorMessage instances', () => {
    expect(isLogMessage(new LogMessage('message'))).toBe(true);
    expect(isLogMessage(new ErrorMessage('message', new Error('fail')))).toBe(true);
  });

  it('should return false for other types', () => {
    expect(isLogMessage('message')).toBe(false);
    expect(isLogMessage(10)).toBe(false);
    expect(isLogMessage(true)).toBe(false);
    expect(isLogMessage(null)).toBe(false);
    expect(isLogMessage(undefined)).toBe(false);
    expect(isLogMessage({})).toBe(false);
    expect(isLogMessage({ toString: () => {} })).toBe(false);
  });

  it('should return true for objects that implement the LogMessage interface', () => {
    const validLogMessage = {
      toString: () => 'message',
      toObject: () => ({ message: 'message' }),
      get: (key: string) => (key === 'message' ? 'message' : undefined),
    };

    expect(isLogMessage(validLogMessage)).toBe(true);
  });

  it('should return false for objects that partially implement the LogMessage interface', () => {
    class TragicErrorMessage extends ErrorMessage {
      constructor(message: string) {
        super(message, new Error('tragic'));
        // @ts-ignore - explicitly breaking the interface for testing
        this.toObject = undefined;
      }
    }

    const tragicErrorMessage = new TragicErrorMessage('message');
    expect(isLogMessage(tragicErrorMessage)).toBe(false);
  });
});
