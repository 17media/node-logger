import { flattenObject } from '../utils';
import LogMessage from './logMessage';

/**
 * 錯誤日誌訊息類別。
 * 繼承自 LogMessage，額外處理 Error 物件並自動提取 Stack Trace。
 */
class ErrorMessage extends LogMessage {
  /**
   * @param message 描述性訊息
   * @param err 原始 Error 物件或其他錯誤資訊
   * @param fields 額外的 metadata
   */
  constructor(message: string, err: any, fields: Record<string, any> = {}) {
    super(message, fields);

    // 確保 err 是 Error 實例，若非則轉換為 Error
    const error =
      err instanceof Error
        ? err
        : new Error(JSON.stringify(flattenObject(err)));

    // 將錯誤資訊合併至 metadata 欄位
    Object.assign(this.fields, {
      error: `${error.name}: ${error.message}`,
      stackTrace: error.stack,
    });
  }

  /**
   * 轉換為字串，包含描述訊息與完整堆疊追蹤
   */
  toString(): string {
    return `${super.toString()}\n${this.fields.stackTrace}`;
  }
}

export default ErrorMessage;
