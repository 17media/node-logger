import request from 'superagent';

import Logger from './logger';
import { hasAllKeys, formatLogLevel } from '../utils';
import { LogLevel, LogMessageInterface, FluentdLoggerConfig } from '../types';

const requiredConfig = [
  'collectorUrl',
];

class FluentdLogger extends Logger {
  IsConfigValid(): boolean {
    return super.IsConfigValid() &&
      hasAllKeys(this.config, requiredConfig);
  }

  async Log(level: LogLevel, message: LogMessageInterface, label: string, logTime: number): Promise<void> {
    const {
      project,
      environment,
      collectorUrl,
    } = this.config as FluentdLoggerConfig;

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
    } catch (error: any) {
      console.error('Error sending log to Fluentd:', error.message);
    }
  }
}

export default FluentdLogger;
