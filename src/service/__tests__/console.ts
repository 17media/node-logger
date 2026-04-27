import { LogMessage } from '../../message';
import { Console } from '../';
import { LogLevel } from '../../enum/level';

describe('service/console', () => {
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  beforeEach(() => {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  afterAll(() => {
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
  });

  it('should log INFO to console.log', async () => {
    const config = {
      project: 'cool project',
      environment: 'production',
    };

    const logger = new Console(config);
    await logger.Log(
      LogLevel.INFO,
      new LogMessage('something happened'),
      'some:label'
    );

    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[INFO]'));
  });

  it('should log ERROR to console.error', async () => {
    const config = {
      project: 'cool project',
      environment: 'production',
    };

    const logger = new Console(config);
    await logger.Log(
      LogLevel.ERROR,
      new LogMessage('something terrible happened'),
      'some:label'
    );

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR]')
    );
  });

  it('should log WARN to console.warn', async () => {
    const config = {
      project: 'cool project',
      environment: 'production',
    };

    const logger = new Console(config);
    await logger.Log(
      LogLevel.WARN,
      new LogMessage('something suspicious'),
      'some:label'
    );

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('[WARN]')
    );
  });
});
