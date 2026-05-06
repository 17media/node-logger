import { hasAllKeys } from '../';

describe('utils/hasAllKeys', () => {
  it('should return true if object has all keys', () => {
    const testObject = { key1: 'val1', key2: 'val2' };
    expect(hasAllKeys(testObject, ['key1', 'key2'])).toBe(true);
  });

  it('should return false if object is missing a key', () => {
    const testObject = { key1: 'val1' };
    expect(hasAllKeys(testObject, ['key1', 'key2'])).toBe(false);
  });

  it('should return false if testObject is null or not an object', () => {
    expect(hasAllKeys(null, ['key'])).toBe(false);
    expect(hasAllKeys('not-an-object', ['key'])).toBe(false);
    expect(hasAllKeys(undefined, ['key'])).toBe(false);
  });

  it('should return false if keys is not an array', () => {
    // @ts-ignore
    expect(hasAllKeys({}, null)).toBe(false);
    // @ts-ignore
    expect(hasAllKeys({}, 'key')).toBe(false);
  });

  it('should return true for empty keys array', () => {
    expect(hasAllKeys({}, [])).toBe(true);
  });
});
