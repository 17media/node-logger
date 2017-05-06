import { isObject } from 'lodash';
import * as services from './service';
import LOG_LEVEL from './enum/logLevel';

const { MIN_LOG_LEVEL } = process.env;

class MasterLogger {
  constructor(config) {
    if (!isObject(config)) {
      throw new Error('invalid config');
    }

    this.services = Object.keys(services)
    // filter out missing configs
    .filter(key => config[key])
    // merge base and service config
    .map(key => ({
      key,
      serviceConfig: Object.assign(
        {},
        config.base,
        config[key],
        // override minimum log level if specified by environment variable
        MIN_LOG_LEVEL ? { minLogLevel: LOG_LEVEL[MIN_LOG_LEVEL] } : {}),
    }))
    // create services from configs
    .map(({ key, serviceConfig }) => new services[key](serviceConfig))
    // filter out services with invalid configs
    .filter(service => service.IsConfigValid());
  }

  // wrap Log function and reuse label
  Label(label) {
    return {
      Log: (logLevel, logMessage) => this.Log(logLevel, logMessage, label),
    };
  }

  Log(logLevel, logMessage, label) {
    const tasks = this.services
    // filter by log level
    .filter(service => service.ShouldLog(logLevel))
    // initiate log service
    .map(service => service.Log(logLevel, logMessage, label));

    return Promise.all(tasks).catch(() => Promise.resolve());
  }
}

export default MasterLogger;
