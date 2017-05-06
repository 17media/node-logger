import {
  isObject,
  isArray,
  has,
} from 'lodash';

const hasAllKeys = (testObject, keys) => {
  if (!isObject(testObject) || !isArray(keys)) {
    return false;
  }

  return keys.reduce((result, key) => result && has(testObject, key));
};

const formatLogLevel = logLevel => ['debug', 'info', 'warn', 'error'][logLevel];

const flattenObject = (source, prefix = '', refSet = new Set()) => {
  // if type or source is primitive, return value directly
  if (!isObject(source)) {
    const result = {};
    result[prefix || 'value'] = source;
    return result;
  }

  // check for circular reference
  if (refSet.has(source)) {
    return {};
  }
  refSet.add(source);

  // process fields in object
  return Object.keys(source)
  .map(key => flattenObject(
    source[key],
    prefix ? `${prefix}.${key}` : key,
    refSet),
  )
  .reduce(
    (prev, curr) => Object.assign(prev, curr),
    {},
  );
};

export {
  hasAllKeys,
  formatLogLevel,
  flattenObject,
};
