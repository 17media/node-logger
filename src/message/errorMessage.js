import { isError } from 'lodash';
import LogMessage from './logMessage';

class ErrorMessage extends LogMessage {
  constructor(message, err, fields = {}) {
    super(message, fields);

    const error =
      isError(err) ? err : new Error(JSON.stringify(err));

    Object.assign(this.fields, {
      error: `${error.name}: ${error.message}`,
      stackTrace: error.stack,
    });
  }

  toString() {
    return `${super.toString()}\n${this.fields.stackTrace}`;
  }
}

export default ErrorMessage;
