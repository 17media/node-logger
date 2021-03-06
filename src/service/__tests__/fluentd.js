import superagent from 'superagent';
import { LogMessage } from '../../message';
import { Fluentd } from '../';
import Level from '../../enum/level';

describe('service/fluentd', () => {
  let sendRequest;
  let endRequest;
  const originalSuperagentPost = superagent.post;

  beforeEach(() => {
    endRequest = jest.fn();
    sendRequest = jest.fn(() => ({
      end: endRequest,
    }));
    superagent.post = jest.fn(() => ({
      send: sendRequest,
    }));
  });

  afterAll(() => {
    superagent.post = originalSuperagentPost;
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
    // missing collector URL
    const config = {
      project: 'cool project',
      environment: 'production',
    };

    const logger = new Fluentd(config);

    expect(logger.IsConfigValid()).toBe(false);
  });

  it('should send log request to collector', () => {
    const config = {
      project: 'cool project',
      environment: 'production',
      collectorUrl: 'some URL',
    };

    const logger = new Fluentd(config);

    logger.Log(Level.ERROR, new LogMessage('something happened'), 'some:label');

    expect(superagent.post).toHaveBeenCalledTimes(1);
    expect(superagent.post).toHaveBeenCalledWith(config.collectorUrl);
    expect(sendRequest).toHaveBeenCalledTimes(1);
    expect(endRequest).toHaveBeenCalledTimes(1);
  });

  it('should replce . with _ in object keys', () => {
    const config = {
      project: 'cool project',
      environment: 'production',
      collectorUrl: 'some URL',
    };
    const additionalInfo = {
      'object.key.key2': 'value',
      key_not_affected: 'value2',
    };

    const logger = new Fluentd(config);

    logger.Log(Level.ERROR, new LogMessage('something happened', additionalInfo), 'some:label');

    expect(superagent.post).toHaveBeenCalledTimes(1);
    expect(superagent.post).toHaveBeenCalledWith(config.collectorUrl);
    expect(sendRequest).toHaveBeenCalledTimes(1);
    expect(sendRequest).toHaveBeenCalledWith(expect.any(String));
    expect(sendRequest).toHaveBeenCalledWith(expect.stringMatching(/"object_key_key2":"value"/g));
    expect(sendRequest).toHaveBeenCalledWith(expect.stringMatching(/"key_not_affected":"value2"/g));
    expect(endRequest).toHaveBeenCalledTimes(1);
  });

  it('should not expose internal service error', () => {
    endRequest = jest.fn(callback => callback(new Error()));

    const config = {
      project: 'cool project',
      environment: 'production',
      collectorUrl: 'some URL',
    };

    const logger = new Fluentd(config);

    return logger.Log(Level.ERROR, new LogMessage('something happened'), 'some:label')
      .then(() => {
        expect(superagent.post).toHaveBeenCalledTimes(1);
        expect(superagent.post).toHaveBeenCalledWith(config.collectorUrl);
        expect(sendRequest).toHaveBeenCalledTimes(1);
        expect(endRequest).toHaveBeenCalledTimes(1);
      });
  });
});
