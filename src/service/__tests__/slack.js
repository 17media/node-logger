import SlackClient from '@slack/client';

import { LogMessage } from '../../message';
import { Slack } from '../';
import Level from '../../enum/level';

describe('service/fluentd', () => {
  const originalSlackClientWebClient = SlackClient.WebClient;
  let postMessage;

  beforeEach(() => {
    postMessage = jest.fn(() => Promise.resolve());
    SlackClient.WebClient = jest.fn(() => ({
      chat: {
        postMessage,
      },
    }));
  });

  afterAll(() => {
    SlackClient.WebClient = originalSlackClientWebClient;
  });

  it('should check for slack token and channel in config', () => {
    const config = {
      project: 'cool project',
      environment: 'production',
      slackToken: 'slack token',
      slackChannel: 'cool channel',
    };

    const logger = new Slack(config);

    expect(logger.IsConfigValid()).toBe(true);
  });

  it('should detect missing slack token in config', () => {
    // missing slack token
    const config = {
      project: 'cool project',
      environment: 'production',
      slackChannel: 'cool channel',
    };

    const logger = new Slack(config);

    expect(logger.IsConfigValid()).toBe(false);
  });

  it('should detect missing slack channel in config', () => {
    // missing slack channel
    const config = {
      project: 'cool project',
      environment: 'production',
      slackToken: 'slack token',
    };

    const logger = new Slack(config);

    expect(logger.IsConfigValid()).toBe(false);
  });

  it('should send log request to collector', () => {
    const config = {
      project: 'cool project',
      environment: 'production',
      slackToken: 'slack token',
      slackChannel: 'cool channel',
    };

    const logger = new Slack(config);

    logger.Log(Level.ERROR, new LogMessage('something happened', { key: 'value' }), 'some:label');

    expect(SlackClient.WebClient).toHaveBeenCalledTimes(1);
    expect(SlackClient.WebClient).toHaveBeenCalledWith(config.slackToken);
    expect(postMessage).toHaveBeenCalledTimes(1);
  });

  it('should send log request to collector and support options', () => {
    const config = {
      project: 'cool project',
      environment: 'production',
      slackToken: 'slack token',
      slackChannel: 'cool channel',
      options: {
        fields: {
          maxLine: 1,
          short: true,
        },
        getFooter: () => 'cool project - production - some:label',
      },
    };

    const logger = new Slack(config);

    logger.Log(Level.ERROR, new LogMessage('something happened', { key: 'line1\nline2' }), 'some:label');

    expect(SlackClient.WebClient).toHaveBeenCalledTimes(1);
    expect(SlackClient.WebClient).toHaveBeenCalledWith(config.slackToken);
    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith('cool channel', '', expect.objectContaining({
      attachments: [{
        color: 'danger',
        title: '[ERROR] something happened',
        fields: [{
          title: 'key',
          value: 'line1',
          short: true,
        }],
        footer: 'cool project - production - some:label',
      }],
    }));
  });

  it('should reuse created web client', () => {
    const config = {
      project: 'cool project',
      environment: 'production',
      slackToken: 'slack token',
      slackChannel: 'cool channel',
    };

    const logger = new Slack(config);

    logger.Log(Level.ERROR, new LogMessage('something happened'), 'some:label');
    logger.Log(Level.ERROR, new LogMessage('something happened'), 'some:label');

    expect(SlackClient.WebClient).toHaveBeenCalledTimes(1);
    expect(SlackClient.WebClient).toHaveBeenCalledWith(config.slackToken);
    expect(postMessage).toHaveBeenCalledTimes(2);
  });

  it('should not expose internal service error', () => {
    postMessage = jest.fn(() => Promise.reject(new Error()));

    const config = {
      project: 'cool project',
      environment: 'production',
      slackToken: 'slack token',
      slackChannel: 'cool channel',
    };

    const logger = new Slack(config);

    return logger.Log(Level.ERROR, new LogMessage('something happened'), 'some:label')
      .then(() => {
        expect(SlackClient.WebClient).toHaveBeenCalledTimes(1);
        expect(SlackClient.WebClient).toHaveBeenCalledWith(config.slackToken);
        expect(postMessage).toHaveBeenCalledTimes(1);
      });
  });
});
