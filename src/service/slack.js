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
    } = this.config;

    const logMessageFields = message.toObject();
    const messageOpts = {
      as_user: true,
      attachments: [
        {
          color: formatLogLevelSlackColor(level),
          title: `[${formatLogLevel(level).toUpperCase()}] ${message.get('message')}`,
          fields: Object.keys(logMessageFields)
            .filter(key => !(key === 'message'))
            .map(key => ({
              title: key,
              value: logMessageFields[key],
              short: false,
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
