import Logger from './logger';
import { formatLogLevel } from '../utils';
import { LogLevel } from '../enum/level';
import { LogMessageInterface } from '../types';

/**
 * 標準控制台 (Console) 日誌服務
 */
class ConsoleLogger extends Logger {
  /**
   * 實作 Log 介面，將訊息輸出至 stdout/stderr
   */
  async Log(
    level: LogLevel,
    message: LogMessageInterface,
    label: string,
    logTime: number
  ): Promise<void> {
    const { project } = this.config;
    const timeStr = new Date(logTime).toISOString();
    const levelStr = formatLogLevel(level).toUpperCase();
    
    // 組合基礎日誌內容
    let logOutput = `[${timeStr}] [${levelStr}] ${project} - ${label}: ${message.toString()}`;

    const fields = message.toObject();
    // 移除重複的 message 欄位，避免 metadata 冗餘
    delete fields.message;

    // 若有 metadata (fields)，以格式化 JSON 塊狀呈現，提升易讀性
    if (Object.keys(fields).length > 0) {
      logOutput += `\n${JSON.stringify(fields, null, 2)}`;
    }

    // 根據層級決定呼叫控制台的不同方法
    if (level >= LogLevel.ERROR) {
      console.error(logOutput);
    } else if (level === LogLevel.WARN) {
      console.warn(logOutput);
    } else {
      console.log(logOutput);
    }
  }
}

export default ConsoleLogger;
