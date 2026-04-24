import * as services from './service';
import Level from './enum/level';
import { LogLevel, LogMessageInterface, LoggerConfig, BaseLoggerConfig } from './types';
import Logger from './service/logger';
import { getEnvLogLevel, DEFAULT_TIMEOUT_MS } from './constants';

const { LOG_LEVEL } = process.env;

class MasterLogger {
  public services: Logger<BaseLoggerConfig>[];

  constructor(config: LoggerConfig) {
    if (config === null || typeof config !== 'object' || Array.isArray(config)) {
      throw new Error('invalid config');
    }

    const envLogLevel = getEnvLogLevel(LOG_LEVEL);

    this.services = (Object.keys(services) as Array<keyof typeof services>)
      // filter out missing configs
      .filter((key) => !!config[key])
      // merge base and service config
      .map((key) => {
        const serviceConfig = Object.assign(
          {},
          config.base,
          config[key],
          // override log level if specified by environment variable
          envLogLevel !== undefined ? { logLevel: envLogLevel } : {}
        ) as any;

        return new (services[key] as any)(serviceConfig);
      })
      // filter out services with invalid configs
      .filter((service) => service.IsConfigValid());
  }

  // wrap Log function and reuse label
  Label(label: string) {
    return {
      Log: (level: LogLevel, message: LogMessageInterface) => this.Log(level, message, label),
    };
  }

  async Log(level: LogLevel, message: LogMessageInterface, label: string) {
    const logTime = new Date().getTime();
    
    const activeServices = this.services.filter(service => service.ShouldLog(level));
    const tasks = activeServices.map(service => {
        const serviceName = service.constructor.name || 'Service';
        let timeoutId: NodeJS.Timeout;
        
        const timeoutPromise = new Promise<void>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error(`Logging timeout after ${DEFAULT_TIMEOUT_MS}ms for ${serviceName}`));
          }, DEFAULT_TIMEOUT_MS);
        });

        return Promise.race([
          service.Log(level, message, label, logTime),
          timeoutPromise,
        ]).finally(() => {
          clearTimeout(timeoutId);
        });
      });

    const results = await Promise.allSettled(tasks);
    
    // 檢查是否有任何服務執行失敗
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const serviceName = activeServices[index]?.constructor.name || 'Service';
        console.error(`[MasterLogger] Service "${serviceName}" failed to log:`, result.reason);
      }
    });

    return results;
  }
}

export default MasterLogger;
