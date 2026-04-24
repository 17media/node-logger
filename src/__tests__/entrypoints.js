import * as index from '../index';
import * as serviceIndex from '../service/index';
import * as messageIndex from '../message/index';
import methodAlias from '../enum/methodAlias';

describe('entrypoints coverage', () => {
  it('should import and access all entrypoints', () => {
    // 透過 Object.keys 或訪問屬性來確保資料被執行讀取
    expect(Object.keys(index).length).toBeGreaterThan(0);
    expect(Object.keys(serviceIndex).length).toBeGreaterThan(0);
    expect(Object.keys(messageIndex).length).toBeGreaterThan(0);
    expect(methodAlias.info).toBe(1);
  });
});
