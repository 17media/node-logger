/* eslint-env node, mocha */
/* eslint-disable no-console, no-unused-expressions */
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chai from 'chai';

import { LogMessage } from '../../lib/message';
import { Console } from '../../lib/service';
import Level from '../../lib/enum/level';

const { expect } = chai;

chai.use(sinonChai);

describe('service/console', () => {
  it('should log to console', () => {
    const mockConsole = sinon.stub(console, 'log');
    const config = {
      project: 'cool project',
      environment: 'production',
    };

    const logger = new Console(config);
    logger.Log(Level.ERROR, new LogMessage('something happened'), 'some:label');

    expect(mockConsole).to.have.been.calledOnce;

    mockConsole.restore();
  });
});
/* eslint-enable no-console, no-unused-expressions */
