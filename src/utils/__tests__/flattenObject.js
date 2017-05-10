import deepFreeze from 'deep-freeze';
import { flattenObject } from '../';

describe('utils/flattenObject', () => {
  it('should return simple object for primitive types', () => {
    expect(flattenObject(10)).toEqual({ value: 10 });
    expect(flattenObject('hsuan')).toEqual({ value: 'hsuan' });
    expect(flattenObject(true)).toEqual({ value: true });
    expect(flattenObject(null)).toEqual({ value: null });
  });

  it('should not affect single-level objects', () => {
    const testObject = {
      key1: 'value1',
      key2: 2,
      key3: true,
      key4: null,
    };

    // should not modify object itself
    deepFreeze(testObject);

    expect(flattenObject(testObject)).toEqual(testObject);
  });

  it('should flatten multi-level objects', () => {
    const testObject = {
      key1: 'value1',
      key2: [1, 2, 'buckle my shoe'],
      key3: {
        key1: '31',
        key2: 32,
      },
    };

    // should not modify object itself
    deepFreeze(testObject);

    const expected = {
      key1: 'value1',
      'key2.0': 1,
      'key2.1': 2,
      'key2.2': 'buckle my shoe',
      'key3.key1': '31',
      'key3.key2': 32,
    };

    expect(flattenObject(testObject)).toEqual(expected);
  });

  it('should remove circular references', () => {
    const obj1 = {
      key1: '11',
    };

    const obj2 = {
      key1: '21',
      deeper: {
        obj1,
      },
    };

    // create circular reference
    obj1.obj2 = obj2;

    const testObject = {
      key1: 'value1',
      obj1,
    };

    // should not modify object itself
    deepFreeze(testObject);

    const expected = {
      key1: 'value1',
      'obj1.key1': '11',
      'obj1.obj2.key1': '21',
      'obj1.obj2.deeper.obj1': '[Circular Reference]',
    };

    expect(flattenObject(testObject)).toEqual(expected);
  });
});
