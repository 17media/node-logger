const flattenObject = (source, prefix = '', refSet = new Set()) => {
  // if type or source is primitive, return value directly
  if (source === null || (typeof source !== 'object' && typeof source !== 'function')) {
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

const hasAllKeys = (testObject, keys) => {
  if (testObject === null || typeof testObject !== 'object' || !Array.isArray(keys)) {
    return false;
  }

  return keys.reduce((result, key) => result && Object.hasOwn(testObject, key), true);
};

const formatLogLevel = level => ['debug', 'info', 'warn', 'error', 'fatal'][level];

// check if testLogMessage implements all interfaces of LogMessage
const isLogMessage = testLogMessage => !!testLogMessage
  && typeof testLogMessage.toString === 'function'
  && typeof testLogMessage.toObject === 'function'
  && typeof testLogMessage.get === 'function';

export {
  flattenObject,
  formatLogLevel,
  hasAllKeys,
  isLogMessage,
};
