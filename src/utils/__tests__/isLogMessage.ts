import { LogMessage, ErrorMessage } from '../../message';
import { isLogMessage } from '../';

describe('utils/isLogMessage', () => {
  it('should accept basic log message types', () => {
    expect(isLogMessage(new LogMessage('message'))).toBe(true);
    expect(isLogMessage(new ErrorMessage('message'))).toBe(true);
  });

  it('should reject primitive types', () => {
    expect(isLogMessage('message')).toBe(false);
    expect(isLogMessage(0)).toBe(false);
    expect(isLogMessage(-1)).toBe(false);
    expect(isLogMessage(true)).toBe(false);
    expect(isLogMessage(null)).toBe(false);
    expect(isLogMessage(undefined)).toBe(false);
    expect(isLogMessage([1, 2, 3])).toBe(false);
    expect(isLogMessage({ key: 'value' })).toBe(false);
  });

  it('should accept extended types', () => {
    class CoolLogMessage extends LogMessage {
      toString() {
        return `${super.toString()}\nthis message is very cool!`;
      }
    }

    class TragicErrorMessage extends ErrorMessage {
      toString() {
        return `OMG!: ${super.toString()}`;
      }
    }

    const coolLogMessage = new CoolLogMessage('message');
    const tragicErrorMessage = new TragicErrorMessage('message');

    expect(isLogMessage(coolLogMessage)).toBe(true);
    expect(isLogMessage(tragicErrorMessage)).toBe(true);
  });
});
