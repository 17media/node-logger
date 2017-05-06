import { flattenObject } from '../utils';

class LogMessage {
  constructor(message, fields = {}) {
    this.message = message;
    this.fields = flattenObject(fields);
  }

  get(fieldName) {
    if (fieldName === 'message') {
      return this.message;
    }

    return this.fields[fieldName];
  }

  toString() {
    return this.message;
  }

  toObject() {
    return Object.assign({}, { message: this.message }, this.fields);
  }
}

export default LogMessage;
