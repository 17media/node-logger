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
    const obj1: any = {
      key1: '11',
    };

    const obj2: any = {
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

  it('should respect maxDepth limit', () => {
    const source = {
      level1: {
        level2: {
          level3: 'value',
        },
      },
    };

    expect(flattenObject(source, '', 2)).toEqual({
      'level1.level2': '[Max Depth Reached]',
    });
  });

  it('should handle Date objects', () => {
    const date = new Date('2024-01-01T00:00:00Z');
    // Note: Date is mocked to 2017-07-05 in testing/date.ts
    expect(flattenObject(date)).toEqual({ value: '2017-07-05T00:00:00.000Z' });
  });

  it('should handle Map objects', () => {
    const map = new Map([['a', 1], ['b', 2]]);
    expect(flattenObject(map)).toEqual({ a: 1, b: 2 });
  });

  it('should handle Set objects', () => {
    const set = new Set([1, 2]);
    expect(flattenObject(set)).toEqual({ '0': 1, '1': 2 });
  });

  it('should handle Error objects', () => {
    const error = new Error('boom');
    error.name = 'CustomError';
    const result = flattenObject(error);
    expect(result.name).toBe('CustomError');
    expect(result.message).toBe('boom');
    expect(result.stack).toBeDefined();
  });

  it('should handle objects with toJSON', () => {
    const obj = {
      foo: 'bar',
      toJSON: () => ({ converted: true })
    };
    expect(flattenObject(obj)).toEqual({ converted: true });
  });

  it('should handle toJSON that throws error', () => {
    const obj = {
      foo: 'bar',
      toJSON: () => { throw new Error('toJSON failed'); }
    };
    // Should fall back to normal object flattening, function is stringified
    const result = flattenObject(obj);
    expect(result.foo).toBe('bar');
    expect(typeof result.toJSON).toBe('string');
    expect(result.toJSON).toContain('toJSON failed');
  });

  it('should handle toJSON that returns the same object', () => {
    const obj: any = { foo: 'bar' };
    obj.toJSON = () => obj;
    const result = flattenObject(obj);
    expect(result.foo).toBe('bar');
    expect(typeof result.toJSON).toBe('string');
  });

  it('should handle non-plain objects without keys', () => {
    class MyClass {
      toString() { return 'MyClassInstance'; }
    }
    expect(flattenObject(new MyClass())).toEqual({ value: 'MyClassInstance' });
  });

  it('should handle Map containing itself (circular reference)', () => {
    const m = new Map();
    m.set('self', m);
    m.set('data', 'hello');
    const result = flattenObject(m);
    expect(result['self']).toBe('[Circular Reference]');
    expect(result['data']).toBe('hello');
  });

  it('should handle Set containing itself (circular reference)', () => {
    const s = new Set();
    s.add(s);
    const result = flattenObject(s);
    expect(result['0']).toBe('[Circular Reference]');
  });
});
