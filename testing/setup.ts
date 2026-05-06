import './date';

/**
 * 自定義的 deepFreeze 函數，用於測試確保物件不被修改。
 */
const deepFreeze = <T extends object>(obj: T): T => {
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const value = (obj as any)[prop];
    if (
      value !== null &&
      (typeof value === 'object' || typeof value === 'function') &&
      !Object.isFrozen(value)
    ) {
      deepFreeze(value);
    }
  });
  return obj;
};

// 暴露給全域，這樣測試檔案就不需要 import
(global as any).deepFreeze = deepFreeze;
