import * as services from './service';
import Level from './enum/level';

const { LOG_LEVEL } = process.env;

class MasterLogger {
  constructor(config) {
    if (config === null || typeof config !== 'object' || Array.isArray(config)) {
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
        // override log level if specified by environment variable
        LOG_LEVEL ? { logLevel: Level[LOG_LEVEL] } : {}),
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

  async Log(level, message, label) {
    const logTime = new Date().getTime();
    const tasks = this.services
      // filter by log level
      .filter(service => service.ShouldLog(level))
      // initiate log service
      .map(service => service.Log(level, message, label, logTime));

    const results = await Promise.allSettled(tasks);
    
    // 檢查是否有任何服務執行失敗
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const serviceName = this.services[index]?.constructor.name || 'UnknownService';
        console.error(`[MasterLogger] Service "${serviceName}" failed to log:`, result.reason);
      }
    });

    return results;
  }
}

export default MasterLogger;
