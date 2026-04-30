import createLogger from '../index';
import Logger from '../logger';
import { LogMessage } from '../message';

describe('Backward Compatibility (v2.x)', () => {
  const config = {
    project: 'legacy-project',
    environment: 'production',
    Console: true
  };

  const originalLog = Logger.prototype.Log;
  beforeEach(() => {
    Logger.prototype.Log = jest.fn(() => Promise.resolve([])) as any;
  });
  afterAll(() => {
    Logger.prototype.Log = originalLog;
  });

  it('should support v2.x style calling: createLogger(config, label)', async () => {
    // 在 v2.x 中，開發者可能直接傳入兩個參數
    const logger = createLogger(config as any, 'legacy-label');
    
    // 驗證回傳的是否為帶有 info 等方法的實例，而不是一個 factory function
    expect(typeof logger).toBe('function');
    expect(typeof logger.info).toBe('function');

    await logger.info('hello legacy');

    expect(Logger.prototype.Log).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(LogMessage),
      'legacy-label'
    );
  });

  it('should support top-level project/environment config (v2.x style)', async () => {
    // v2.x 可能沒有 .base 屬性
    const logger = createLogger(config as any, 'no-base-label');
    await logger.info('test');

    expect(Logger.prototype.Log).toHaveBeenCalled();
  });
});
