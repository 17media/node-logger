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

  Log(level, message, label) {
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
      logTime: new Date().getTime(),
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

    return new Promise((resolve) => {
      request
      .post(collectorUrl)
      .send(JSON.stringify(fluentdObject))
      .end(() => resolve());
    });
  }
}

export default FluentdLogger;
