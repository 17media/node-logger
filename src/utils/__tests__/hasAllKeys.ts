import { hasAllKeys } from '../';

describe('utils/hasAllKeys', () => {
  it('should check input types', () => {
    expect(hasAllKeys({ key: 'value' }, 'key' as any)).toBe(false);
    expect(hasAllKeys(null, null as any)).toBe(false);
    expect(hasAllKeys(0, 0 as any)).toBe(false);
    expect(hasAllKeys('key', 'key' as any)).toBe(false);
  });

  it('should return true when all keys are present', () => {
    const testObject = {
      key1: 'value1',
      key2: 'value2',
    };
    const requiredKeys = ['key1', 'key2'];

    deepFreeze(testObject);
    deepFreeze(requiredKeys);

    expect(hasAllKeys(testObject, requiredKeys)).toBe(true);
  });

  it('should return false when some keys are missing', () => {
    const testObject = {
      key1: 'value1',
    };
    const requiredKeys = ['key1', 'key2'];

    deepFreeze(testObject);
    deepFreeze(requiredKeys);

    expect(hasAllKeys(testObject, requiredKeys)).toBe(false);
  });

  it('should return true when keys list is empty', () => {
    const testObject = {
      key1: 'value1',
    };
    const requiredKeys: string[] = [];

    deepFreeze(testObject);
    deepFreeze(requiredKeys);

    expect(hasAllKeys(testObject, requiredKeys)).toBe(true);
  });
});
