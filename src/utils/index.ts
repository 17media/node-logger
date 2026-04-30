import { LogMessageInterface } from '../types';
import { DEFAULT_MAX_DEPTH } from '../constants';

/**
 * 將 Log 層級數字轉換為對應的字串標籤
 */
const formatLogLevel = (level: number): string =>
  ['debug', 'info', 'warn', 'error', 'fatal'][level] || 'all';

/**
 * 巢狀物件扁平化函數。
 * 用於將複雜的 metadata 轉換為 key-value 對，方便搜尋與儲存。
 * 
 * @param source 原始物件
 * @param prefix 鍵值前綴（用於遞迴路徑）
 * @param maxDepth 最大扁平化深度，避免過深的物件造成效能問題
 */
const flattenObject = (
  source: unknown,
  prefix = '',
  maxDepth = DEFAULT_MAX_DEPTH
): Record<string, any> => {
  const result: Record<string, any> = {};
  const stack: Array<{ obj: any; path: string; depth: number }> = [
    { obj: source, path: prefix, depth: 0 },
  ];
  const seen = new Set(); // 用於偵測循環引用

  while (stack.length > 0) {
    const { obj, path, depth } = stack.pop()!;

    // 處理基本型別 (Primitive types)
    if (
      obj === null ||
      (typeof obj !== 'object' && typeof obj !== 'function')
    ) {
      result[path || 'value'] = obj;
      continue;
    }

    // 循環引用檢查，避免無限遞迴
    if (seen.has(obj)) {
      result[path] = '[Circular Reference]';
      continue;
    }
    seen.add(obj);

    // 深度限制檢查
    if (depth >= maxDepth) {
      result[path] = '[Max Depth Reached]';
      continue;
    }

    // 特殊型別處理：Date 物件直接轉為 ISO 字串
    if (Object.prototype.toString.call(obj) === '[object Date]') {
      result[path || 'value'] = (obj as Date).toISOString();
      continue;
    }

    // 特殊型別處理：Map 轉換為一般物件後再進行扁平化
    if (obj instanceof Map) {
      const mapObj: Record<string, any> = {};
      obj.forEach((val, key) => {
        mapObj[String(key)] = val;
      });
      stack.push({ obj: mapObj, path, depth });
      continue;
    }

    // 特殊型別處理：Set 轉換為陣列
    if (obj instanceof Set) {
      stack.push({ obj: Array.from(obj), path, depth });
      continue;
    }

    // 特殊型別處理：Error 物件提取核心資訊
    if (obj instanceof Error) {
      stack.push({
        obj: {
          name: obj.name,
          message: obj.message,
          stack: obj.stack,
        },
        path,
        depth,
      });
      continue;
    }

    // 支援物件自定義的 toJSON 方法 (如某些 SDK 物件)
    if (typeof obj.toJSON === 'function' && !(obj instanceof Date)) {
      try {
        const json = obj.toJSON();
        if (json !== obj) {
          stack.push({ obj: json, path, depth });
          continue;
        }
      } catch (e) {
        // toJSON 執行失敗則退回一般物件處理流程 (確保此分支被執行)
        const _err = e; 
      }
    }

    // 處理一般物件與陣列的 Key
    const keys = Object.keys(obj);

    // 處理非純物件但無 enumerable keys 的情況 (如自定義 Class 實例)
    if (keys.length === 0 && obj.constructor !== Object && !Array.isArray(obj)) {
      result[path || 'value'] = String(obj);
      continue;
    }

    // 將內容推入 stack 進行迭代處理
    for (let i = keys.length - 1; i >= 0; i--) {
      const key = keys[i];
      stack.push({
        obj: (obj as any)[key],
        path: path ? `${path}.${key}` : key,
        depth: depth + 1,
      });
    }
  }

  return result;
};

/**
 * 檢查物件是否包含所有指定的必要 Key
 */
const hasAllKeys = (testObject: unknown, keys: string[]): boolean => {
  if (
    testObject === null ||
    typeof testObject !== 'object' ||
    !Array.isArray(keys)
  ) {
    return false;
  }

  const obj = testObject as Record<string, any>;
  return keys.reduce(
    (result, key) => result && Object.prototype.hasOwnProperty.call(obj, key),
    true
  );
};

/**
 * 類型守衛 (Type Guard)：檢查物件是否實作了 LogMessage 介面
 */
const isLogMessage = (
  testLogMessage: unknown
): testLogMessage is LogMessageInterface => {
  if (!testLogMessage || typeof testLogMessage !== 'object') {
    return false;
  }

  const candidate = testLogMessage as Record<string, any>;
  return (
    typeof candidate.toString === 'function' &&
    typeof candidate.toObject === 'function' &&
    typeof candidate.get === 'function'
  );
};

export { flattenObject, formatLogLevel, hasAllKeys, isLogMessage };
