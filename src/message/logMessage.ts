import { flattenObject } from '../utils';
import { LogMessageInterface } from '../types';

/**
 * 標準日誌訊息類別。
 * 負責將原始訊息與 metadata 進行封裝與扁平化。
 */
class LogMessage implements LogMessageInterface {
  public message: string;
  public fields: Record<string, any>;

  constructor(message: string, fields: Record<string, any> = {}) {
    this.message = message;
    this.fields = flattenObject(fields); // 建立實例時即進行扁平化處理
  }

  /**
   * 取得特定欄位的值，支援快捷取得 "message"
   */
  get(fieldName: string): any {
    if (fieldName === 'message') {
      return this.message;
    }

    return this.fields[fieldName];
  }

  /**
   * 轉換為簡單字串，僅回傳主訊息內容
   */
  toString(): string {
    return this.message;
  }

  /**
   * 轉換為純 JSON 物件，包含訊息與所有已扁平化的欄位
   */
  toObject(): Record<string, any> {
    return Object.assign({}, { message: this.message }, this.fields);
  }
}

export default LogMessage;
