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

    const fluentdProcessed = Object.keys(fluentdObject)
      .reduce((currentObject, nextKey) => (
        Object.assign({}, currentObject, {
          [nextKey.replace(/\./g, '_')]: fluentdObject[nextKey],
        })), {});

    return new Promise((resolve) => {
      request
      .post(collectorUrl)
      .send(JSON.stringify(fluentdProcessed))
      .end(() => resolve());
    });
  }
}

export default FluentdLogger;
