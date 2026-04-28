import * as services from './service';
import { LogLevel } from './enum/level';
import { LogMessageInterface, LoggerConfig, BaseLoggerConfig } from './types';
import Logger from './service/logger';
import { getEnvLogLevel, DEFAULT_TIMEOUT_MS } from './constants';

const { LOG_LEVEL } = process.env;

/**
 * Logger 核心管理類別，負責協調多個日誌服務。
 */
class MasterLogger {
  // 已啟用的日誌服務清單
  public services: Logger<BaseLoggerConfig>[];

  constructor(config: LoggerConfig) {
    if (
      config === null ||
      typeof config !== 'object' ||
      Array.isArray(config)
    ) {
      throw new Error('invalid config');
    }

    // 必須包含基礎配置，因為其中包含專案名稱與環境資訊
    if (!config.base) {
      throw new Error('Missing "base" configuration. "project" and "environment" are required.');
    }

    const envLogLevel = getEnvLogLevel(LOG_LEVEL);

    this.services = (Object.keys(services) as Array<keyof typeof services>)
      // 過濾掉未在 config 中定義的服務
      .filter(key => !!config[key])
      // 實例化各個服務並注入配置
      .map(key => {
        const serviceConfigValue = config[key];
        const serviceSpecificConfig = typeof serviceConfigValue === 'object' ? serviceConfigValue : {};

        const serviceConfig = Object.assign(
          {},
          config.base,
          serviceSpecificConfig,
          // 如果有環境變數 LOG_LEVEL，則覆蓋原有配置的層級
          envLogLevel !== undefined ? { logLevel: envLogLevel } : {}
        ) as any;

        const ServiceClass = services[key] as any;
        return new ServiceClass(serviceConfig);
      })
      // 僅保留配置檢查通過的服務
      .filter(service => service.IsConfigValid());
  }

  /**
   * 建立一個綁定特定標籤 (label) 的 Log 介面。
   * @param label 用於識別日誌來源（例如模組名稱）
   */
  Label(label: string) {
    return {
      Log: (level: LogLevel, message: LogMessageInterface) =>
        this.Log(level, message, label),
    };
  }

  /**
   * 核心 Log 執行函數。
   * 將日誌同時發送至所有已啟用的服務，並處理逾時與錯誤。
   */
  async Log(level: LogLevel, message: LogMessageInterface, label: string) {
    const logTime = new Date().getTime();

    // 僅過濾出符合層級要求的服務
    const activeServices = this.services.filter(service =>
      service.ShouldLog(level)
    );
    
    const tasks = activeServices.map(service => {
      const serviceName = service.constructor.name || 'Service';
      let timeoutId: NodeJS.Timeout;

      // 逾時保護，避免單一服務（如 Slack 網路問題）卡住整個系統
      const timeoutPromise = new Promise<void>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(
            new Error(
              `日誌發送逾時 (${DEFAULT_TIMEOUT_MS}ms) - 服務: ${serviceName}`
            )
          );
        }, DEFAULT_TIMEOUT_MS);
      });

      return Promise.race([
        service.Log(level, message, label, logTime),
        timeoutPromise,
      ]).finally(() => {
        clearTimeout(timeoutId);
      });
    });

    // 等待所有服務執行完畢（不論成功或失敗）
    const results = await Promise.allSettled(tasks);

    // 檢查是否有服務執行失敗並輸出至 stderr，但不影響主程式流程
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const serviceName =
          activeServices[index]?.constructor.name || 'Service';
        console.error(
          `[MasterLogger] Service "${serviceName}" failed to log:`,
          result.reason
        );
      }
    });

    return results;
  }
}

export default MasterLogger;
