import request from 'superagent';
import { LogMessage } from '../../message';
import { Fluentd } from '../';
import Level from '../../enum/level';
import { LogLevel } from '../../enum/level';

// Mock the entire superagent module
jest.mock('superagent', () => {
  const sendRequest = jest.fn().mockReturnThis();
  const postRequest = jest.fn(() => ({
    send: sendRequest,
    // Modern superagent is a promise, so we should support .then()
    then: (resolve: any) => resolve({ ok: true }),
  }));
  return {
    post: postRequest,
    default: {
      post: postRequest,
    },
  };
});

describe('service/fluentd', () => {
  let mockSend: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSend = (request.post as jest.Mock)('url').send;
    jest.clearAllMocks();
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
    await logger.Log(Level.ERROR as LogLevel, new LogMessage('something happened'), 'some:label', Date.now());

    expect(request.post).toHaveBeenCalledTimes(1);
    expect(request.post).toHaveBeenCalledWith(config.collectorUrl);
    expect(mockSend).toHaveBeenCalledTimes(1);
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
    await logger.Log(Level.ERROR as LogLevel, new LogMessage('something happened', additionalInfo), 'some:label', Date.now());

    expect(request.post).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      object_key_key2: 'value',
      key_not_affected: 'value2',
    }));
  });

  it('should not expose internal service error', async () => {
    mockSend.mockImplementationOnce(() => Promise.reject(new Error('Network Error')));

    const config = {
      project: 'cool project',
      environment: 'production',
      collectorUrl: 'http://some-url',
    };

    const logger = new Fluentd(config);
    // Should not throw
    await logger.Log(Level.ERROR as LogLevel, new LogMessage('something happened'), 'some:label', Date.now());

    expect(request.post).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledTimes(1);
  });
});
