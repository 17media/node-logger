import { has, isArray, isFunction, isObject } from 'lodash';

const flattenObject = (source, prefix = '', refSet = new Set()) => {
  // if type or source is primitive, return value directly
  if (!isObject(source)) {
    return { [prefix || 'value']: source };
  }

  // check for circular reference
  if (refSet.has(source)) {
    return { [prefix]: '[Circular Reference]' };
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

const formatLogLevel = level => ['debug', 'info', 'warn', 'error', 'fatal'][level];

const getProcessEnv = name => process.env[name];

const hasAllKeys = (testObject, keys) => {
  if (!isObject(testObject) || !isArray(keys)) {
    return false;
  }

  return keys.reduce((result, key) => result && has(testObject, key), true);
};

// check if testLogMessage implements all interfaces of LogMessage
const isLogMessage = testLogMessage => !!testLogMessage
  && isObject(testLogMessage.toString)
  && isFunction(testLogMessage.toString)
  && isFunction(testLogMessage.toObject)
  && isFunction(testLogMessage.get);

export {
  flattenObject,
  formatLogLevel,
  getProcessEnv,
  hasAllKeys,
  isLogMessage,
};
