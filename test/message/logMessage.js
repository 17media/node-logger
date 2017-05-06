/* eslint-env node, mocha */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { LogMessage } from '../../lib/message';

describe('message/logMessage', () => {
  it('should construct log message without optional fields', () => {
    const message = 'something happened';
    const logMessage = new LogMessage(message);

    expect(logMessage.get('message')).to.equal(message);
    expect(logMessage.toString()).to.equal(message);
    expect(logMessage.toObject()).to.deep.equal({ message });
  });

  it('should construct log message with optional fields', () => {
    const message = 'something happened';
    const optionalFields = {
      key1: 'something',
      key2: 'very',
      key3: 'important',
    };
    const expectedObject = Object.assign({ message }, optionalFields);

    const logMessage = new LogMessage(message, optionalFields);

    expect(logMessage.get('message')).to.equal(message);
    expect(logMessage.toString()).to.equal(message);
    expect(logMessage.toObject()).to.deep.equal(expectedObject);
  });

  it('should construct log message with primitive type optional field', () => {
    const message = 'something happened';
    const logMessage = new LogMessage(message, 'wow');
    const expectedObject = Object.assign({ message }, { value: 'wow' });

    expect(logMessage.get('message')).to.equal(message);
    expect(logMessage.toString()).to.equal(message);
    expect(logMessage.toObject()).to.deep.equal(expectedObject);
  });

  it('should not expose internal object', () => {
    const message = 'something happened';
    const optionalFields = {
      key1: 'something',
      key2: 'very',
      key3: 'important',
    };
    deepFreeze(optionalFields);

    const logMessage = new LogMessage(message, optionalFields);
    deepFreeze(logMessage);

    logMessage.toObject().key1 = 'SOMETHING';
    logMessage.toObject().message = 'SOMETHING HAPPENED';

    const expectedObject = Object.assign({ message }, optionalFields);

    expect(logMessage.get('key1')).to.equal(optionalFields.key1);
    expect(logMessage.toString()).to.equal(message);
    expect(logMessage.toObject()).to.deep.equal(expectedObject);
  });
});
