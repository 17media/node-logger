import { WebClient } from '@slack/web-api';

import Logger from './logger';
import { hasAllKeys, formatLogLevel } from '../utils';

const requiredConfig = [
  'slackToken',
  'slackChannel',
];

function formatLogLevelSlackColor(logLevel) {
  return ['good', 'good', 'warning', 'danger', 'danger'][logLevel];
}

function formatMessage(message, maxLine) {
  if (!maxLine) {
    return message;
  }

  return message
    .split('\n')
    .slice(0, maxLine)
    .join('\n');
}

class SlackLogger extends Logger {
  IsConfigValid() {
    return super.IsConfigValid() &&
      hasAllKeys(this.config, requiredConfig);
  }

  async Log(level, message, label, logTime) {
    if (!this.slackClient) {
      this.slackClient = new WebClient(this.config.slackToken);
    }

    const {
      project,
      environment,
      slackChannel,
      options: { fields, getFooter },
    } = this.config;

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
