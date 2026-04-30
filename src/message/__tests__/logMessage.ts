import { LogMessage } from '../index';

describe('message/logMessage', () => {
  it('should construct log message without optional fields', () => {
    const message = 'something happened';
    const logMessage = new LogMessage(message);

    expect(logMessage.message).toBe(message);
    expect(logMessage.fields).toEqual({});
  });

  it('should construct log message with optional fields', () => {
    const message = 'something happened';
    const optionalFields = {
      key1: 'value1',
      key2: 2,
    };
    const logMessage = new LogMessage(message, optionalFields);

    deepFreeze(optionalFields);
    deepFreeze(logMessage);

    expect(logMessage.message).toBe(message);
    expect(logMessage.get('key1')).toBe(optionalFields.key1);
    expect(logMessage.get('key2')).toBe(optionalFields.key2);
  });

  it('should handle non-object optional fields', () => {
    const message = 'something happened';
    const logMessage = new LogMessage(message, 'wow' as any);

    expect(logMessage.message).toBe(message);
    expect(logMessage.get('value')).toBe('wow');
  });

  it("should return message from .get('message')", () => {
    const message = 'something happened';
    const logMessage = new LogMessage(message);

    expect(logMessage.get('message')).toBe(message);
  });

  it('should return undefined from .get() for non-existing field', () => {
    const message = 'something happened';
    const logMessage = new LogMessage(message);

    expect(logMessage.get('non-existing')).toBeUndefined();
  });

  it('should return message from .toString()', () => {
    const message = 'something happened';
    const logMessage = new LogMessage(message);

    expect(logMessage.toString()).toBe(message);
  });

  it('should return all fields from .toObject()', () => {
    const message = 'something happened';
    const optionalFields = {
      key1: 'value1',
      key2: 2,
    };
    const logMessage = new LogMessage(message, optionalFields);

    const expected = Object.assign({ message }, optionalFields);
    expect(logMessage.toObject()).toEqual(expected);
  });
});
