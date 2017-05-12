import { isObject, isArray } from 'lodash';
import * as services from './service';
import { getProcessEnv } from './utils';
import Level from './enum/level';

class MasterLogger {
  constructor(config) {
    if (!isObject(config) || isArray(config)) {
      throw new Error('invalid config');
    }

    const envLogLevel = Level[getProcessEnv('LOG_LEVEL')];

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
        // override log level if specified by environment variable
        envLogLevel ? { logLevel: envLogLevel } : {}),
    }))
    // create services from configs
    .map(({ key, serviceConfig }) => new services[key](serviceConfig))
    // filter out services with invalid configs
    .filter(service => service.IsConfigValid());
  }

  // wrap Log function and reuse label
  Label(label) {
    return {
      Log: (level, message) => this.Log(level, message, label),
    };
  }

  Log(level, message, label) {
    const tasks = this.services
    // filter by log level
    .filter(service => service.ShouldLog(level))
    // initiate log service
    .map(service => service.Log(level, message, label));

    return Promise.all(tasks).catch(() => Promise.resolve());
  }
}

export default MasterLogger;
