import { LogMessage } from '../../message';
import { Fluentd } from '../';
import { LogLevel } from '../../enum/level';

describe('service/fluentd', () => {
  let mockFetch: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
      } as Response)
    );
  });

  afterEach(() => {
    mockFetch.mockRestore();
  });

  it('should check for collector URL in config', () => {
    const config = {
      project: 'cool project',
      environment: 'production',
      collectorUrl: 'some URL',
    };

    const logger = new Fluentd(config);
    expect(logger.IsConfigValid()).toBe(true);
  });

  it('should detect missing collector URL in config', () => {
    const config = {
      project: 'cool project',
      environment: 'production',
    };

    const logger = new Fluentd(config as any);
    expect(logger.IsConfigValid()).toBe(false);
  });

  it('should send log request to collector', async () => {
    const config = {
      project: 'cool project',
      environment: 'production',
      collectorUrl: 'http://some-url',
    };

    const logger = new Fluentd(config);
    await logger.Log(
      LogLevel.ERROR,
      new LogMessage('something happened'),
      'some:label',
      Date.now()
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      config.collectorUrl,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
  });

  it('should replace . with _ in object keys', async () => {
    const config = {
      project: 'cool project',
      environment: 'production',
      collectorUrl: 'http://some-url',
    };
    const additionalInfo = {
      'object.key.key2': 'value',
      key_not_affected: 'value2',
    };

    const logger = new Fluentd(config);
    await logger.Log(
      LogLevel.ERROR,
      new LogMessage('something happened', additionalInfo),
      'some:label',
      Date.now()
    );

    const body = JSON.parse(
      (mockFetch.mock.calls[0][1] as RequestInit).body as string
    );
    expect(body).toEqual(
      expect.objectContaining({
        object_key_key2: 'value',
        key_not_affected: 'value2',
      })
    );
  });

  it('should handle response not ok', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response)
    );

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const config = {
      project: 'cool project',
      environment: 'production',
      collectorUrl: 'http://some-url',
    };

    const logger = new Fluentd(config);
    await logger.Log(
      LogLevel.ERROR,
      new LogMessage('something happened'),
      'some:label',
      Date.now()
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Error sending log to Fluentd: 500 Internal Server Error'
      )
    );
    consoleSpy.mockRestore();
  });

  it('should not expose internal service error on fetch rejection', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.reject(new Error('Network Error'))
    );
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const config = {
      project: 'cool project',
      environment: 'production',
      collectorUrl: 'http://some-url',
    };

    const logger = new Fluentd(config);
    // Should not throw
    await logger.Log(
      LogLevel.ERROR,
      new LogMessage('something happened'),
      'some:label',
      Date.now()
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error sending log to Fluentd:',
      'Network Error'
    );
    consoleSpy.mockRestore();
  });
});
