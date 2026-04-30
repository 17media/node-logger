import Logger from './logger';
import { hasAllKeys, formatLogLevel } from '../utils';
import { LogMessageInterface, FluentdLoggerConfig } from '../types';
import { LogLevel } from '../enum/level';

// Fluentd 服務必要配置項
const requiredConfig = ['collectorUrl'];

/**
 * Fluentd 資料收集服務 (通常用於彙整至 ELK 或 BigQuery)
 */
class FluentdLogger extends Logger<FluentdLoggerConfig> {
  IsConfigValid(): boolean {
    return super.IsConfigValid() && hasAllKeys(this.config, requiredConfig);
  }

  /**
   * 以 HTTP POST 方式發送 JSON 資料至 Fluentd 收集器
   */
  async Log(
    level: LogLevel,
    message: LogMessageInterface,
    label: string,
    logTime: number
  ): Promise<void> {
    const { project, environment, collectorUrl } = this.config;

    // 組合要傳送至 Fluentd 的結構化資料
    const fluentdObject = Object.assign({}, message.toObject(), {
      project,
      environment,
      label,
      level: formatLogLevel(level),
      logTime,
    });

    /**
     * 注意：Fluentd 的 Key 若包含 "." 符號，在某些解析器中會產生問題，
     * 因此在此將所有 Key 中的 "." 替換為 "_"。
     */
    Object.keys(fluentdObject).forEach(key => {
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
        console.error(
          `Error sending log to Fluentd: ${response.status} ${response.statusText}`
        );
      }
    } catch (error: any) {
      console.error('Error sending log to Fluentd:', error.message);
    }
  }
}

export default FluentdLogger;
