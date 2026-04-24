import { WebClient } from '@slack/web-api';

import Logger from './logger';
import { hasAllKeys, formatLogLevel } from '../utils';
import { LogLevel, LogMessageInterface, SlackLoggerConfig } from '../types';

const requiredConfig = [
  'slackToken',
  'slackChannel',
];

function formatLogLevelSlackColor(logLevel: LogLevel) {
  // map LogLevel enum to slack colors
  const colors: Record<number, string> = {
    [LogLevel.DEBUG]: 'good',
    [LogLevel.INFO]: 'good',
    [LogLevel.WARN]: 'warning',
    [LogLevel.ERROR]: 'danger',
    [LogLevel.FATAL]: 'danger',
  };
  return colors[logLevel] || 'good';
}

function formatMessage(message: string, maxLine?: number) {
  if (!maxLine) {
    return message;
  }

  return message
    .split('\n')
    .slice(0, maxLine)
    .join('\n');
}

class SlackLogger extends Logger<SlackLoggerConfig> {
  private slackClient?: WebClient;

  IsConfigValid(): boolean {
    return super.IsConfigValid() &&
      hasAllKeys(this.config, requiredConfig);
  }

  async Log(level: LogLevel, message: LogMessageInterface, label: string, logTime: number): Promise<void> {
    if (!this.slackClient) {
      this.slackClient = new WebClient(this.config.slackToken);
    }

    const {
      project,
      environment,
      slackChannel,
      options,
    } = this.config;

    const {
      fields,
      getFooter,
    } = options || {};

    const {
      maxLine,
      short = false,
      excludes = [],
    } = fields || {};

    const fieldsExcludes = ['message'].concat(excludes);
    const logMessageFields = message.toObject();
    const footer = getFooter
      ? getFooter(logMessageFields, logTime)
      : `${project} - ${environment} - ${label}`;

    const messageOpts = {
      channel: slackChannel,
      text: `[${formatLogLevel(level).toUpperCase()}] ${message.get('message')}`,
      attachments: [
        {
          color: formatLogLevelSlackColor(level),
          title: `[${formatLogLevel(level).toUpperCase()}] ${message.get('message')}`,
          fields: Object.keys(logMessageFields)
            .filter(key => !fieldsExcludes.includes(key))
            .map(key => ({
              title: key,
              value: formatMessage(logMessageFields[key], maxLine),
              short,
            })),
          footer,
        },
      ],
    };

    try {
      const result = await this.slackClient.chat.postMessage(messageOpts);
      if (!result.ok) {
        // Log to console if slack fails but don't crash
        console.error(`Slack logging failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending message to Slack:', error);
    }
  }
}

export default SlackLogger;
