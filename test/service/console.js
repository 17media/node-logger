/* eslint-env node, mocha */
/* eslint-disable no-console, no-unused-expressions */
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chai from 'chai';

import { LogMessage } from '../../lib/message';
import { ConsoleLogger } from '../../lib/service';
import LOG_LEVEL from '../../lib/enum/logLevel';

const { expect } = chai;

chai.use(sinonChai);

describe('service/console', () => {
  it('should log to console', () => {
    const mockConsole = sinon.stub(console, 'log');
    const config = {
      project: 'cool project',
      environment: 'production',
    };

    const logger = new ConsoleLogger(config);
    logger.Log(LOG_LEVEL.ERROR, new LogMessage('something happened'), 'some:label');

    expect(mockConsole).to.have.been.calledOnce;

    mockConsole.restore();
  });
});
/* eslint-enable no-console, no-unused-expressions */
