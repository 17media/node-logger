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

    // 取得所有 metadata
    const fields = message.toObject();

    // 為了保持資料完整性，我們不刪除 fields 內的任何欄位。
    // 雖然這可能導致 message 欄位在 JSON 中重複出現，但能避免隱藏使用者自定義的資料。
    const displayFields = { ...fields };

    // 若有 metadata (fields)，以格式化 JSON 塊狀呈現，提升易讀性
    if (Object.keys(displayFields).length > 0) {
      logOutput += `\n${JSON.stringify(displayFields, null, 2)}`;
    }

    // 根據層級決定呼叫控制台的不同方法
    if (level >= LogLevel.ERROR) {
      console.error(logOutput);
      return;
    }

    if (level === LogLevel.WARN) {
      console.warn(logOutput);
      return;
    }

    console.log(logOutput);
  }
}

export default ConsoleLogger;
