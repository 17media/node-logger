import { LogMessage } from '../../message';
import { Console } from '../';
import Level from '../../enum/level';

describe('service/console', () => {
  it('should log to console', () => {
    const originalConsoleLog = console.log;
    console.log = jest.fn();

    const config = {
      project: 'cool project',
      environment: 'production',
    };

    const logger = new Console(config);
    logger.Log(Level.ERROR, new LogMessage('something happened'), 'some:label');

    expect(console.log).toHaveBeenCalledTimes(1);

    console.log = originalConsoleLog;
  });
});
