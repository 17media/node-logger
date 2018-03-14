import SlackClient from '@slack/client';

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

  Log(level, message, label) {
    if (!this.slackClient) {
      this.slackClient = new SlackClient.WebClient(this.config.slackToken);
    }

    const {
      project,
      environment,
      slackChannel,
      options: { fields },
    } = this.config;

    const {
      maxLine,
      short = false,
      excludes = [],
    } = fields || {};

    const fieldsExcludes = ['message'].concat(excludes);
    const logMessageFields = message.toObject();
    const messageOpts = {
      as_user: true,
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
          footer: `${project} - ${environment} - ${label}`,
        },
      ],
    };

    return this.slackClient.chat.postMessage(slackChannel, '', messageOpts)
      .catch(() => Promise.resolve());
  }
}

export default SlackLogger;
