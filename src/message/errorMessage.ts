import { flattenObject } from '../utils';
import LogMessage from './logMessage';

class ErrorMessage extends LogMessage {
  constructor(message: string, err: any, fields: Record<string, any> = {}) {
    super(message, fields);

    const error =
      err instanceof Error ? err : new Error(JSON.stringify(flattenObject(err)));

    Object.assign(this.fields, {
      error: `${error.name}: ${error.message}`,
      stackTrace: error.stack,
    });
  }

  toString(): string {
    return `${super.toString()}\n${this.fields.stackTrace}`;
  }
}

export default ErrorMessage;
