import { LogMessage, ErrorMessage } from '../message';
import Level from '../enum/level';
import Logger from '../logger';
import createLogger from '../createLogger';

describe('createLogger (Boundaries)', () => {
  const label = 'test:boundary';
  const config = {
    base: {
      logLevel: Level.INFO,
      project: 'boundary project',
      environment: 'test',
    },
    Console: true,
  };
  const originalLoggerLog = Logger.prototype.Log;

  beforeEach(() => {
    Logger.prototype.Log = jest.fn(() => Promise.resolve());
  });

  afterAll(() => {
    Logger.prototype.Log = originalLoggerLog;
  });

  const logger = createLogger(config)(label);

  it('should handle zero arguments gracefully', () => {
    logger.info();
    expect(Logger.prototype.Log).toHaveBeenCalledTimes(1);
    const message = Logger.prototype.Log.mock.calls[0][1];
    expect(message).toBeInstanceOf(LogMessage);
    expect(message.message).toBeUndefined();
  });

  it('should handle many arguments by using the first as message and second as fields (LogMessage)', () => {
    logger.info('msg', { a: 1 }, { b: 2 });
    expect(Logger.prototype.Log).toHaveBeenCalledTimes(1);
    const message = Logger.prototype.Log.mock.calls[0][1];
    expect(message).toBeInstanceOf(LogMessage);
    expect(message.message).toBe('msg');
    expect(message.fields).toEqual({ a: 1 });
  });

  it('should detect error in any position and create ErrorMessage', () => {
    const error = new Error('fail');
    logger.info(error, 'msg');
    expect(Logger.prototype.Log).toHaveBeenCalledTimes(1);
    const message = Logger.prototype.Log.mock.calls[0][1];
    expect(message).toBeInstanceOf(ErrorMessage);
    // Note: ErrorMessage constructor expects (message, err, fields)
    // createLogger.js: message = new ErrorMessage(...args);
    // So this will call new ErrorMessage(error, 'msg')
    // This is a weird use case but the logger should handle it without crashing
  });

  it('should handle null/undefined as message', () => {
    logger.info(null);
    expect(Logger.prototype.Log).toHaveBeenCalledTimes(1);
    const message = Logger.prototype.Log.mock.calls[0][1];
    expect(message.message).toBeNull();

    logger.info(undefined);
    expect(Logger.prototype.Log).toHaveBeenCalledTimes(2);
    const message2 = Logger.prototype.Log.mock.calls[1][1];
    expect(message2.message).toBeUndefined();
  });

  it('should handle non-object info correctly', () => {
    logger.info('msg', 'not-an-object');
    expect(Logger.prototype.Log).toHaveBeenCalledTimes(1);
    const message = Logger.prototype.Log.mock.calls[0][1];
    // flattenObject('not-an-object') will return { value: 'not-an-object' }
    expect(message.fields).toEqual({ value: 'not-an-object' });
  });
});
