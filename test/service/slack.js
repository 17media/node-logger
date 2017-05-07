/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chai from 'chai';
import ChatFacet from '@slack/client/lib/clients/web/facets/chat';
import SlackClient from '@slack/client';

import { LogMessage } from '../../lib/message';
import { SlackLogger } from '../../lib/service';
import LOG_LEVEL from '../../lib/enum/logLevel';

const { expect } = chai;

chai.use(sinonChai);

describe('service/fluentd', () => {
  let postRequest;
  let slackClient;

  beforeEach(() => {
    slackClient = sinon.spy(SlackClient, 'WebClient');
    postRequest = sinon.stub(ChatFacet.prototype, 'postMessage').returns(Promise.resolve());
  });

  afterEach(() => {
    slackClient.restore();
    postRequest.restore();
  });

  it('should check for slack token and channel in config', () => {
    const config = {
      project: 'cool project',
      environment: 'production',
      slackToken: 'slack token',
      slackChannel: 'cool channel',
    };

    const logger = new SlackLogger(config);

    expect(logger.IsConfigValid()).to.equal(true);
  });

  it('should detect missing slack token in config', () => {
    // missing slack token
    const config = {
      project: 'cool project',
      environment: 'production',
      slackChannel: 'cool channel',
    };

    const logger = new SlackLogger(config);

    expect(logger.IsConfigValid()).to.equal(false);
  });

  it('should detect missing slack channel in config', () => {
    // missing slack channel
    const config = {
      project: 'cool project',
      environment: 'production',
      slackToken: 'slack token',
    };

    const logger = new SlackLogger(config);

    expect(logger.IsConfigValid()).to.equal(false);
  });

  it('should send log request to collector', () => {
    const config = {
      project: 'cool project',
      environment: 'production',
      slackToken: 'slack token',
      slackChannel: 'cool channel',
    };

    const logger = new SlackLogger(config);

    logger.Log(LOG_LEVEL.ERROR, new LogMessage('something happened'), 'some:label');

    expect(slackClient).to.have.been.calledOnce;
    expect(slackClient).to.have.been.calledWith(config.slackToken);
    expect(postRequest).to.have.been.calledOnce;
  });
});
/* eslint-enable no-unused-expressions */
