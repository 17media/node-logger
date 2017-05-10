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

    logger.Log(Level.ERROR, new LogMessage('something happened'), 'some:label');

    expect(SlackClient.WebClient).toHaveBeenCalledTimes(1);
    expect(SlackClient.WebClient).toHaveBeenCalledWith(config.slackToken);
    expect(postMessage).toHaveBeenCalledTimes(1);
  });
});
