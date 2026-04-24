import Logger from '../logger';
import createLogger from '../createLogger';
import { LogMessage } from '../message';

describe('createLogger', () => {
  const config = {
    base: {
      project: 'cool project',
      environment: 'production',
    },
    Console: true,
  };
  const originalLoggerLog = Logger.prototype.Log;

  beforeEach(() => {
    Logger.prototype.Log = jest.fn(() => Promise.resolve([]));
  });

  afterAll(() => {
    Logger.prototype.Log = originalLoggerLog;
  });

  it('should create logger function and call log correctly', async () => {
    const logger = createLogger(config as any)('some:label');
    await logger.info('something happened');

    expect(Logger.prototype.Log).toHaveBeenCalledTimes(1);
    expect(Logger.prototype.Log).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ message: 'something happened' }),
      'some:label'
    );
  });

  it('should handle error object without custom message', async () => {
    const logger = createLogger(config as any)('some:label');
    const error = new Error('original error message');
    await logger.error(error);

    expect(Logger.prototype.Log).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ message: 'original error message' }),
      'some:label'
    );
  });

  it('should handle log without additional fields', async () => {
    const logger = createLogger(config as any)('some:label');
    // Call without second argument to trigger args[1] || {}
    await (logger as any).info('just message');

    expect(Logger.prototype.Log).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ message: 'just message' }),
      'some:label'
    );
  });

  it('should handle custom LogMessage instance', async () => {
    const logger = createLogger(config as any)('some:label');
    const customMessage = new LogMessage('custom message', { foo: 'bar' });
    await logger.info(customMessage);

    expect(Logger.prototype.Log).toHaveBeenCalledWith(
      1,
      customMessage,
      'some:label'
    );
  });
});
