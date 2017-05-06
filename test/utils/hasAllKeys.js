/* eslint-env node, mocha */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { hasAllKeys } from '../../lib/utils';

describe('utils/hasAllKeys', () => {
  it('should check input types', () => {
    expect(hasAllKeys('key', ['key'])).to.equal(false);
    expect(hasAllKeys({ key: 'value' }, 'key')).to.equal(false);
    expect(hasAllKeys(null, null)).to.equal(false);
    expect(hasAllKeys(0, 0)).to.equal(false);
    expect(hasAllKeys('key', 'key')).to.equal(false);
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

    expect(hasAllKeys(testObject, requiredKeys)).to.equal(true);
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

    expect(hasAllKeys(testObject, requiredKeys)).to.equal(true);
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

    expect(hasAllKeys(testObject, requiredKeys)).to.equal(false);
  });
});

