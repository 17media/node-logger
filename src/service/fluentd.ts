import Logger from './logger';
import { hasAllKeys, formatLogLevel } from '../utils';
import { LogLevel, LogMessageInterface, FluentdLoggerConfig } from '../types';

const requiredConfig = [
  'collectorUrl',
];

class FluentdLogger extends Logger<FluentdLoggerConfig> {
  IsConfigValid(): boolean {
    return super.IsConfigValid() &&
      hasAllKeys(this.config, requiredConfig);
  }

  async Log(level: LogLevel, message: LogMessageInterface, label: string, logTime: number): Promise<void> {
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
      const response = await fetch(collectorUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fluentdObject),
      });

      if (!response.ok) {
        console.error(`Error sending log to Fluentd: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('Error sending log to Fluentd:', error.message);
    }
  }
}

export default FluentdLogger;
