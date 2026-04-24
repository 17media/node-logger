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
    Logger.prototype.Log = jest.fn(() => Promise.resolve([])) as any;
  });

  afterAll(() => {
    Logger.prototype.Log = originalLoggerLog;
  });

  const logger = createLogger(config as any)(label);

  it('should handle zero arguments gracefully', async () => {
    await (logger.info as any)();
    expect(Logger.prototype.Log).toHaveBeenCalledTimes(1);
    const message = (Logger.prototype.Log as jest.Mock).mock.calls[0][1];
    expect(message).toBeInstanceOf(LogMessage);
    expect(message.message).toBeUndefined();
  });

  it('should handle many arguments by using the first as message and second as fields (LogMessage)', async () => {
    await (logger.info as any)('msg', { a: 1 }, { b: 2 });
    expect(Logger.prototype.Log).toHaveBeenCalledTimes(1);
    const message = (Logger.prototype.Log as jest.Mock).mock.calls[0][1];
    expect(message).toBeInstanceOf(LogMessage);
    expect(message.message).toBe('msg');
    expect(message.fields).toEqual({ a: 1 });
  });

  it('should detect error in any position and create ErrorMessage', async () => {
    const error = new Error('fail');
    await (logger.info as any)(error, 'msg');
    expect(Logger.prototype.Log).toHaveBeenCalledTimes(1);
    const message = (Logger.prototype.Log as jest.Mock).mock.calls[0][1];
    expect(message).toBeInstanceOf(ErrorMessage);
  });

  it('should handle null/undefined as message', async () => {
    await (logger.info as any)(null);
    expect(Logger.prototype.Log).toHaveBeenCalledTimes(1);
    const message = (Logger.prototype.Log as jest.Mock).mock.calls[0][1];
    expect(message.message).toBeNull();

    await (logger.info as any)(undefined);
    expect(Logger.prototype.Log).toHaveBeenCalledTimes(2);
    const message2 = (Logger.prototype.Log as jest.Mock).mock.calls[1][1];
    expect(message2.message).toBeUndefined();
  });

  it('should handle non-object info correctly', async () => {
    await (logger.info as any)('msg', 'not-an-object');
    expect(Logger.prototype.Log).toHaveBeenCalledTimes(1);
    const message = (Logger.prototype.Log as jest.Mock).mock.calls[0][1];
    expect(message.fields).toEqual({ value: 'not-an-object' });
  });
});
