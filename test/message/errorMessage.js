/* eslint-env node, mocha */
import { expect } from 'chai';
import { ErrorMessage } from '../../lib/message';

describe('message/errorMessage', () => {
  it('should construct error message with Error-typed object', () => {
    const message = 'something happened';
    const error = new Error(message);

    const logMessage = new ErrorMessage(message, error);

    const expectedObject = Object.assign({ message }, {
      error: `${error.name}: ${error.message}`,
      stackTrace: error.stack,
    });

    expect(logMessage.get('message')).to.equal(message);
    expect(logMessage.toString()).to.equal(`${message}\n${error.stack}`);
    expect(logMessage.toObject()).to.deep.equal(expectedObject);
  });

  it('should construct error message with non-Error-typed object', () => {
    const message = 'something happened';
    const error = 'some error';

    const logMessage = new ErrorMessage(message, error);

    expect(logMessage.get('message')).to.equal(message);
    expect(logMessage.toObject().error).to.not.equal(null);
    expect(logMessage.toObject().errorStack).to.not.equal(null);
  });
});
