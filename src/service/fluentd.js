import request from 'superagent';

import Logger from './logger';
import { hasAllKeys, formatLogLevel } from '../utils';

const requiredConfig = [
  'collectorUrl',
];

class FluentdLogger extends Logger {
  IsConfigValid() {
    return super.IsConfigValid() &&
      hasAllKeys(this.config, requiredConfig);
  }

  async Log(level, message, label, logTime) {
    const {
      project,
      environment,
      collectorUrl,
    } = this.config;

    const fluentdObject = Object.assign({}, message.toObject(), {
      project,
      environment,
      label,
      level: formatLogLevel(level),
      logTime,
    });

    // replace . with _ in keys because fluentd does not accept .
    Object.keys(fluentdObject)
      .forEach((key) => {
        const newKey = key.replace(/\./g, '_');
        if (newKey !== key) {
          fluentdObject[newKey] = fluentdObject[key];
          delete fluentdObject[key];
        }
      });

    try {
      await request
        .post(collectorUrl)
        .send(fluentdObject);
    } catch (error) {
      console.error('Error sending log to Fluentd:', error.message);
    }
  }
}

export default FluentdLogger;
