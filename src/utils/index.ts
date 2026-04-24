import { LogMessageInterface } from '../types';

const formatLogLevel = (level: number): string => ['debug', 'info', 'warn', 'error', 'fatal'][level] || 'all';

const flattenObject = (source: any, prefix = '', maxDepth = 10): Record<string, any> => {
  const result: Record<string, any> = {};
  const stack: Array<{ obj: any, path: string, depth: number }> = [{ obj: source, path: prefix, depth: 0 }];
  const seen = new Set();

  while (stack.length > 0) {
    const { obj, path, depth } = stack.pop()!;

    // 基本型別處理 (Primitive values)
    if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) {
      result[path || 'value'] = obj;
      continue;
    }

    // 循環引用檢查
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

    // 處理物件與陣列
    const keys = Object.keys(obj);
    for (let i = keys.length - 1; i >= 0; i--) {
      const key = keys[i];
      stack.push({
        obj: obj[key],
        path: path ? `${path}.${key}` : key,
        depth: depth + 1,
      });
    }
  }

  return result;
};

const hasAllKeys = (testObject: any, keys: string[]): boolean => {
  if (testObject === null || typeof testObject !== 'object' || !Array.isArray(keys)) {
    return false;
  }

  return keys.reduce((result, key) => result && Object.prototype.hasOwnProperty.call(testObject, key), true);
};

// check if testLogMessage implements all interfaces of LogMessage
const isLogMessage = (testLogMessage: any): testLogMessage is LogMessageInterface => !!testLogMessage
  && typeof testLogMessage.toString === 'function'
  && typeof testLogMessage.toObject === 'function'
  && typeof testLogMessage.get === 'function';

export {
  flattenObject,
  formatLogLevel,
  hasAllKeys,
  isLogMessage,
};
