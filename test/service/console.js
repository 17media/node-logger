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
  beforeEach(() => {
    sinon.spy(console, 'log');
  });

  afterEach(() => {
    console.log.restore();
  });

  it('should log to console', (done) => {
    const config = {
      project: 'cool project',
      environment: 'production',
    };

    const logger = new ConsoleLogger(config);

    logger.Log(LOG_LEVEL.ERROR, new LogMessage('something happened'), 'some:label')
      .then(expect(console.log).to.have.been.calledOnce)
      .then(done);
  });
});
/* eslint-enable no-console, no-unused-expressions */
