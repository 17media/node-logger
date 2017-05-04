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
    return this.message;
  }

  toObject() {
    return Object.assign({}, this.fields);
  }
}

export default LogMessage;
