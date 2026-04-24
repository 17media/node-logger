import { WebClient } from '@slack/web-api';
import { LogMessage } from '../../message';
import { Slack } from '../';
import Level from '../../enum/level';

// Mock the entire @slack/web-api module
jest.mock('@slack/web-api', () => {
  const postMessage = jest.fn(() => Promise.resolve({ ok: true }));
  return {
    WebClient: jest.fn(() => ({
      chat: {
        postMessage,
      },
    })),
  };
});

describe('service/slack', () => {
  let mockPostMessage: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Get reference to the mocked postMessage
    mockPostMessage = new (WebClient as any)().chat.postMessage;
    jest.clearAllMocks(); // Clear the constructor call from getting the reference
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

  it('should send log request to slack with default color for ALL level', async () => {
    const config = {
      project: 'cool project',
      environment: 'production',
      slackToken: 'slack token',
      slackChannel: 'cool channel',
    };

    const logger = new Slack(config);
    // Level.ALL is -1, which is not in the color map
    await logger.Log(Level.ALL, new LogMessage('something happened'), 'some:label', Date.now());

    expect(mockPostMessage).toHaveBeenCalledWith(expect.objectContaining({
      attachments: [expect.objectContaining({
        color: 'good',
      })],
    }));
  });

  it('should handle missing options in config', async () => {
    const config = {
      project: 'cool project',
      environment: 'production',
      slackToken: 'slack token',
      slackChannel: 'cool channel',
      // no options field
    };

    const logger = new Slack(config);
    await logger.Log(Level.ERROR, new LogMessage('something happened'), 'some:label', Date.now());

    expect(mockPostMessage).toHaveBeenCalledTimes(1);
  });

  it('should send log request to slack', async () => {
    const config = {
      project: 'cool project',
      environment: 'production',
      slackToken: 'slack token',
      slackChannel: 'cool channel',
    };

    const logger = new Slack(config);
    await logger.Log(Level.ERROR, new LogMessage('something happened', { key: 'value' }), 'some:label', Date.now());

    expect(WebClient).toHaveBeenCalledTimes(1);
    expect(WebClient).toHaveBeenCalledWith(config.slackToken);
    expect(mockPostMessage).toHaveBeenCalledTimes(1);
  });

  it('should send log request to slack and support options', async () => {
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
    await logger.Log(Level.ERROR, new LogMessage('something happened', { key: 'line1\nline2' }), 'some:label', Date.now());

    expect(WebClient).toHaveBeenCalledTimes(1);
    expect(WebClient).toHaveBeenCalledWith(config.slackToken);
    expect(mockPostMessage).toHaveBeenCalledTimes(1);
    expect(mockPostMessage).toHaveBeenCalledWith(expect.objectContaining({
      channel: 'cool channel',
      text: '[ERROR] something happened',
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

  it('should reuse created web client', async () => {
    const config = {
      project: 'cool project',
      environment: 'production',
      slackToken: 'slack token',
      slackChannel: 'cool channel',
    };

    const logger = new Slack(config);
    await logger.Log(Level.ERROR, new LogMessage('something happened'), 'some:label', Date.now());
    await logger.Log(Level.ERROR, new LogMessage('something happened'), 'some:label', Date.now());

    expect(WebClient).toHaveBeenCalledTimes(1);
    expect(WebClient).toHaveBeenCalledWith(config.slackToken);
    expect(mockPostMessage).toHaveBeenCalledTimes(2);
  });

  it('should not expose internal service error', async () => {
    mockPostMessage.mockImplementationOnce(() => Promise.reject(new Error('Slack Error')));

    const config = {
      project: 'cool project',
      environment: 'production',
      slackToken: 'slack token',
      slackChannel: 'cool channel',
    };

    const logger = new Slack(config);
    // Should not throw
    await logger.Log(Level.ERROR, new LogMessage('something happened'), 'some:label', Date.now());
    
    expect(WebClient).toHaveBeenCalledTimes(1);
    expect(mockPostMessage).toHaveBeenCalledTimes(1);
  });

  it('should handle Slack API error (ok: false)', async () => {
    mockPostMessage.mockImplementationOnce(() => Promise.resolve({ ok: false, error: 'some_error' }));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const config = {
      project: 'cool project',
      environment: 'production',
      slackToken: 'slack token',
      slackChannel: 'cool channel',
    };

    const logger = new Slack(config);
    await logger.Log(Level.ERROR, new LogMessage('something happened'), 'some:label', Date.now());

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Slack logging failed: some_error'));
    consoleSpy.mockRestore();
  });
});
