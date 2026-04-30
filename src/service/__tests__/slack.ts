import { WebClient } from '@slack/web-api';
import { LogMessage } from '../../message';
import { Slack } from '../';
import { LogLevel } from '../../enum/level';

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
    // LogLevel.ALL is -1, which is not in the color map
    await logger.Log(
      LogLevel.ALL,
      new LogMessage('something happened'),
      'some:label',
      Date.now()
    );

    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: [
          expect.objectContaining({
            color: 'good',
          }),
        ],
      })
    );
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
    await logger.Log(
      LogLevel.ERROR,
      new LogMessage('something happened'),
      'some:label',
      Date.now()
    );

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
    await logger.Log(
      LogLevel.ERROR,
      new LogMessage('something happened', { key: 'value' }),
      'some:label',
      Date.now()
    );

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
    await logger.Log(
      LogLevel.ERROR,
      new LogMessage('something happened', { key: 'line1\nline2' }),
      'some:label',
      Date.now()
    );

    expect(WebClient).toHaveBeenCalledTimes(1);
    expect(WebClient).toHaveBeenCalledWith(config.slackToken);
    expect(mockPostMessage).toHaveBeenCalledTimes(1);
    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'cool channel',
        text: '[ERROR] something happened',
        attachments: [
          {
            color: 'danger',
            title: '[ERROR] something happened',
            fields: [
              {
                title: 'key',
                value: 'line1',
                short: true,
              },
            ],
            footer: 'cool project - production - some:label',
          },
        ],
      })
    );
  });

  it('should reuse created web client', async () => {
    const config = {
      project: 'cool project',
      environment: 'production',
      slackToken: 'slack token',
      slackChannel: 'cool channel',
    };

    const logger = new Slack(config);
    await logger.Log(
      LogLevel.ERROR,
      new LogMessage('something happened'),
      'some:label',
      Date.now()
    );
    await logger.Log(
      LogLevel.ERROR,
      new LogMessage('something happened'),
      'some:label',
      Date.now()
    );

    expect(WebClient).toHaveBeenCalledTimes(1);
    expect(WebClient).toHaveBeenCalledWith(config.slackToken);
    expect(mockPostMessage).toHaveBeenCalledTimes(2);
  });

  it('should not expose internal service error', async () => {
    mockPostMessage.mockImplementationOnce(() =>
      Promise.reject(new Error('Slack Error'))
    );

    const config = {
      project: 'cool project',
      environment: 'production',
      slackToken: 'slack token',
      slackChannel: 'cool channel',
    };

    const logger = new Slack(config);
    // Should not throw
    await logger.Log(
      LogLevel.ERROR,
      new LogMessage('something happened'),
      'some:label',
      Date.now()
    );

    expect(WebClient).toHaveBeenCalledTimes(1);
    expect(mockPostMessage).toHaveBeenCalledTimes(1);
  });

  it('should handle Slack API error (ok: false)', async () => {
    mockPostMessage.mockImplementationOnce(() =>
      Promise.resolve({ ok: false, error: 'some_error' })
    );
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const config = {
      project: 'cool project',
      environment: 'production',
      slackToken: 'slack token',
      slackChannel: 'cool channel',
    };

    const logger = new Slack(config);
    await logger.Log(
      LogLevel.ERROR,
      new LogMessage('something happened'),
      'some:label',
      Date.now()
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Slack logging failed: some_error')
    );
    consoleSpy.mockRestore();
  });

  it('should map log levels to correct slack colors', async () => {
    const config = { project: 'p', environment: 'e', slackToken: 't', slackChannel: 'c' };
    const logger = new Slack(config);

    const testCases = [
      { level: LogLevel.DEBUG, expectedColor: 'good' },
      { level: LogLevel.INFO, expectedColor: 'good' },
      { level: LogLevel.WARN, expectedColor: 'warning' },
      { level: LogLevel.ERROR, expectedColor: 'danger' },
      { level: LogLevel.FATAL, expectedColor: 'danger' },
    ];

    for (const { level, expectedColor } of testCases) {
      await logger.Log(level, new LogMessage('msg'), 'label', 1);
      expect(mockPostMessage).toHaveBeenLastCalledWith(
        expect.objectContaining({
          attachments: [expect.objectContaining({ color: expectedColor })]
        })
      );
    }
  });

  it('should support excluding specific fields in Slack output', async () => {
    const config = {
      project: 'p', environment: 'e', slackToken: 't', slackChannel: 'c',
      options: { fields: { excludes: ['secret', 'token'] } }
    };
    const logger = new Slack(config);
    const message = new LogMessage('msg', { secret: 'xxx', token: 'yyy', public: 'hello' });

    await logger.Log(LogLevel.INFO, message, 'label', 1);

    const lastCall = mockPostMessage.mock.calls[mockPostMessage.mock.calls.length - 1][0];
    const fields = lastCall.attachments[0].fields;
    
    expect(fields.find((f: any) => f.title === 'public')).toBeDefined();
    expect(fields.find((f: any) => f.title === 'secret')).toBeUndefined();
    expect(fields.find((f: any) => f.title === 'token')).toBeUndefined();
  });
});
