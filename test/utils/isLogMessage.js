/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { LogMessage, ErrorMessage } from '../../lib/message';
import { isLogMessage } from '../../lib/utils';

describe('utils/isLogMessage', () => {
  it('should accept basic log message types', () => {
    expect(isLogMessage(new LogMessage('message'))).to.be.true;
    expect(isLogMessage(new ErrorMessage('message'))).to.be.true;
  });

  it('should reject primitive types', () => {
    expect(isLogMessage('message')).to.be.false;
    expect(isLogMessage(0)).to.be.false;
    expect(isLogMessage(-1)).to.be.false;
    expect(isLogMessage(true)).to.be.false;
    expect(isLogMessage(null)).to.be.false;
    expect(isLogMessage(undefined)).to.be.false;
    expect(isLogMessage([1, 2, 3])).to.be.false;
    expect(isLogMessage({ key: 'value' })).to.be.false;
  });

  it('should accept extended types', () => {
    class CoolLogMessage extends LogMessage {
      toString() {
        return `${super.toString()}\nthis message is very cool!`;
      }
    }

    class TragicErrorMessage extends ErrorMessage {
      toString() {
        return `OMG!: ${super.toString()}`;
      }
    }

    const coolLogMessage = new CoolLogMessage('message');
    const tragicErrorMessage = new TragicErrorMessage('message');

    expect(isLogMessage(coolLogMessage)).to.be.true;
    expect(isLogMessage(tragicErrorMessage)).to.be.true;
  });
});
/* eslint-enable no-unused-expressions */
