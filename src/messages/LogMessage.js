import { clone } from 'lodash';

class LogMessage {
  constructor(message, fields = {}) {
    this.message = message;
    this.fields = fields;
  }

  get(fieldName) {
    if (fieldName === 'message') {
      return this.message;
    }

    return this.fields[fieldName];
  }

  toString() {
    return clone(this.message);
  }

  toObject() {
    return clone(this.fields);
  }
}

module.exports = LogMessage;
