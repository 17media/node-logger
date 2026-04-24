import { ErrorMessage } from '../';

describe('message/errorMessage', () => {
  it('should construct error message with Error-typed object', () => {
    const message = 'something happened';
    const error = new Error(message);

    const logMessage = new ErrorMessage(message, error);

    const expectedObject = Object.assign({ message }, {
      error: `${error.name}: ${error.message}`,
      stackTrace: error.stack,
    });

    expect(logMessage.get('message')).toBe(message);
    expect(logMessage.toString()).toBe(`${message}\n${error.stack}`);
    expect(logMessage.toObject()).toEqual(expectedObject);
  });

  it('should construct error message with non-Error-typed object', () => {
    const message = 'something happened';
    const error = 'some error';

    const logMessage = new ErrorMessage(message, error);

    expect(logMessage.get('message')).toBe(message);
    expect(logMessage.toObject().error).not.toBe(null);
    expect(logMessage.toObject().errorStack).not.toBe(null);
  });
});
