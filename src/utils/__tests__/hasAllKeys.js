import deepFreeze from 'deep-freeze';
import { hasAllKeys } from '../';

describe('utils/hasAllKeys', () => {
  it('should check input types', () => {
    expect(hasAllKeys('key', ['key'])).toBe(false);
    expect(hasAllKeys({ key: 'value' }, 'key')).toBe(false);
    expect(hasAllKeys(null, null)).toBe(false);
    expect(hasAllKeys(0, 0)).toBe(false);
    expect(hasAllKeys('key', 'key')).toBe(false);
  });

  it('should return true if all keys are provided', () => {
    const testObject = {
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
    };
    const requiredKeys = ['key1', 'key2'];

    // make sure inputs are not modified
    deepFreeze(testObject);
    deepFreeze(requiredKeys);

    expect(hasAllKeys(testObject, requiredKeys)).toBe(true);
  });

  it('should return true if nothing is required', () => {
    const testObject = {
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
    };
    const requiredKeys = [];

    // make sure inputs are not modified
    deepFreeze(testObject);
    deepFreeze(requiredKeys);

    expect(hasAllKeys(testObject, requiredKeys)).toBe(true);
  });

  it('should return false if some keys are missing', () => {
    const testObject = {
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
    };
    const requiredKeys = ['key1', 'key2', 'missingKey'];

    // make sure inputs are not modified
    deepFreeze(testObject);
    deepFreeze(requiredKeys);

    expect(hasAllKeys(testObject, requiredKeys)).toBe(false);
  });
});

