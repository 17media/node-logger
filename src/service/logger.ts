import { hasAllKeys } from '../utils';
import { LogMessageInterface, BaseLoggerConfig } from '../types';
import { LogLevel } from '../enum/level';

// 所有日誌服務都必須具備的基礎配置欄位
const requiredConfig = ['project', 'environment'];

const baseConfig = {
  // 預設最低日誌紀錄層級
  logLevel: LogLevel.INFO,
};

/**
 * 所有日誌服務 (Console, Slack, Fluentd) 的抽象基底類別。
 * @template T 擴充自 BaseLoggerConfig 的配置型別
 */
abstract class Logger<T extends BaseLoggerConfig = BaseLoggerConfig> {
  protected config: T;

  constructor(config: T) {
    this.config = Object.assign({}, baseConfig, config) as T;
  }

  /**
   * 檢查配置是否有效
   */
  IsConfigValid(): boolean {
    return hasAllKeys(this.config, requiredConfig);
  }

  /**
   * 判斷給定的層級是否達到發送標準
   * @param level 當前日誌層級
   */
  ShouldLog(level: LogLevel): boolean {
    return level >= (this.config.logLevel ?? LogLevel.INFO);
  }

  /**
   * 執行實際的發送邏輯，必須由子類別實作
   */
  abstract Log(
    level: LogLevel,
    message: LogMessageInterface,
    label: string,
    logTime: number
  ): Promise<void>;
}

export default Logger;
