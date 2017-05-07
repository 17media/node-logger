/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chai from 'chai';
import superagent from 'superagent';

import { LogMessage } from '../../lib/message';
import { FluentdLogger } from '../../lib/service';
import LOG_LEVEL from '../../lib/enum/logLevel';

const { expect } = chai;

chai.use(sinonChai);

describe('service/fluentd', () => {
  let postRequest;
  let sendRequest;
  let endRequest;

  beforeEach(() => {
    endRequest = sinon.stub();
    sendRequest = sinon.stub().returns({ end: endRequest });
    postRequest = sinon.stub(superagent, 'post').returns({ send: sendRequest });
  });

  afterEach(() => {
    postRequest.restore();
    sendRequest.reset();
    endRequest.reset();
  });

  it('should check for collector URL in config', () => {
    const config = {
      project: 'cool project',
      environment: 'production',
      collectorUrl: 'some URL',
    };

    const logger = new FluentdLogger(config);

    expect(logger.IsConfigValid()).to.equal(true);
  });

  it('should detect missing collector URL in config', () => {
    // missing collector URL
    const config = {
      project: 'cool project',
      environment: 'production',
    };

    const logger = new FluentdLogger(config);

    expect(logger.IsConfigValid()).to.equal(false);
  });

  it('should send log request to collector', () => {
    const config = {
      project: 'cool project',
      environment: 'production',
      collectorUrl: 'some URL',
    };

    const logger = new FluentdLogger(config);

    logger.Log(LOG_LEVEL.ERROR, new LogMessage('something happened'), 'some:label');

    expect(postRequest).to.have.been.calledOnce;
    expect(postRequest).to.have.been.calledWith(config.collectorUrl);
    expect(sendRequest).to.have.been.calledOnce;
    expect(endRequest).to.have.been.calledOnce;
  });
});
/* eslint-enable no-unused-expressions */
