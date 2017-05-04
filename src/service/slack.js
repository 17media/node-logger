import SlackClient from '@slack/client';

import Logger from './logger';
import { hasAllKeys, formatLogLevel } from '../utils';

const requiredConfig = [
  'slackToken',
  'slackChannel',
];

function formatLogLevelSlackColor(logLevel) {
  return ['good', 'good', 'warning', 'danger'][logLevel];
}

class SlackLogger extends Logger {
  IsConfigValid() {
    return super.IsConfigValid() &&
      hasAllKeys(this.config, requiredConfig);
  }

  Log(logLevel, logMessage, label) {
    if (!this.slackClient) {
      this.slackClient = new SlackClient.WebClient(this.config.slackToken);
    }

    const {
      project,
      environment,
      slackChannel,
    } = this.config;

    const logMessageFields = logMessage.toObject();
    const messageOpts = {
      ['as_user']: true,
      attachments: [
        {
          color: formatLogLevelSlackColor(logLevel),
          title: `[${formatLogLevel(logLevel).toUpperCase()}] ${logMessage.get('message')}`,
          fields: Object.keys(logMessageFields).map(key => ({
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
};

export default SlackLogger;
