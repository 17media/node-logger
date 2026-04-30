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

  it('should support factory pattern (initialize once, create multiple loggers)', async () => {
    // 1. Initialize factory once
    const loggerFactory = createLogger(config as any);
    
    // 2. Create labeled loggers in different modules
    const authLogger = loggerFactory('auth-module');
    const dbLogger = loggerFactory('db-module');

    await authLogger.info('user login');
    await dbLogger.error('query failed');

    expect(Logger.prototype.Log).toHaveBeenCalledTimes(2);
    
    // 驗證第一個呼叫帶有正確的標籤
    expect(Logger.prototype.Log).toHaveBeenNthCalledWith(
      1,
      1, // INFO
      expect.anything(),
      'auth-module'
    );

    // 驗證第二個呼叫帶有正確的標籤
    expect(Logger.prototype.Log).toHaveBeenNthCalledWith(
      2,
      3, // ERROR
      expect.anything(),
      'db-module'
    );
  });
});
