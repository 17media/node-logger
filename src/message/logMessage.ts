import { flattenObject } from '../utils';
import { LogMessageInterface } from '../types';

class LogMessage implements LogMessageInterface {
  public message: string;
  public fields: Record<string, any>;

  constructor(message: string, fields: Record<string, any> = {}) {
    this.message = message;
    this.fields = flattenObject(fields);
  }

  get(fieldName: string): any {
    if (fieldName === 'message') {
      return this.message;
    }

    return this.fields[fieldName];
  }

  toString(): string {
    return this.message;
  }

  toObject(): Record<string, any> {
    return Object.assign({}, { message: this.message }, this.fields);
  }
}

export default LogMessage;
