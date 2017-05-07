/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chai from 'chai';

import { LogMessage, ErrorMessage } from '../lib/message';
import { SlackLogger, FluentdLogger, ConsoleLogger } from '../lib/service';
import LOG_LEVEL from '../lib/enum/logLevel';
import Logger from '../lib/logger';
import createLogger from '../lib/createLogger';

const { expect } = chai;

chai.use(sinonChai);

describe('createLogger', () => {
  const message = 'something happened';
  const label = 'some:label';
  const config = {
    base: {
      minLogLevel: LOG_LEVEL.INFO,
      project: 'cool project',
      environment: 'production',
    },
    SlackLogger: {
      minLogLevel: LOG_LEVEL.ERROR,
      slackToken: 'token',
      slackChannel: 'slack channel',
    },
    ConsoleLogger: true,
    FluentdLogger: {
      collectorUrl: 'collector URL',
    },
  };
  let masterLog;

  beforeEach(() => {
    masterLog = sinon.stub(Logger.prototype, 'Log').returns(Promise.resolve());
  });

  afterEach(() => {
    masterLog.restore();
  });

  it('should initiate logger and pass through configs', () => {
    const slackConfigCheck = sinon.spy(SlackLogger.prototype, 'IsConfigValid');
    const fluentdConfigCheck = sinon.spy(FluentdLogger.prototype, 'IsConfigValid');
    const consoleConfigCheck = sinon.spy(ConsoleLogger.prototype, 'IsConfigValid');

    createLogger(config);

    expect(slackConfigCheck).to.have.been.calledOnce;
    expect(fluentdConfigCheck).to.have.been.calledOnce;
    expect(consoleConfigCheck).to.have.been.calledOnce;

    slackConfigCheck.restore();
    fluentdConfigCheck.restore();
    consoleConfigCheck.restore();
  });

  it('should preset label for future logs', () => {
    const logMessage = new LogMessage(message);

    createLogger(config)(label)(LOG_LEVEL.INFO)(logMessage);

    expect(masterLog).to.have.been.calledOnce;
    expect(masterLog).to.have.been.calledWith(LOG_LEVEL.INFO, logMessage, label);
  });

  it('should create log message implicitly (message)', () => {
    const logMessage = new LogMessage(message);

    createLogger(config)(label).debug(message);

    expect(masterLog).to.have.been.calledOnce;
    expect(masterLog).to.have.been.calledWith(LOG_LEVEL.DEBUG, logMessage, label);
  });

  it('should create log message implicitly (message + info)', () => {
    const additionalInfo = { key: 'value' };
    const logMessage = new LogMessage(message, additionalInfo);

    createLogger(config)(label).debug(message, additionalInfo);

    expect(masterLog).to.have.been.calledOnce;
    expect(masterLog).to.have.been.calledWith(LOG_LEVEL.DEBUG, logMessage, label);
  });

  it('should create error message implicitly (message + error)', () => {
    const error = new Error(message);
    const errorMessage = new ErrorMessage(message, error);

    createLogger(config)(label).debug(message, error);

    expect(masterLog).to.have.been.calledOnce;
    expect(masterLog).to.have.been.calledWith(LOG_LEVEL.DEBUG, errorMessage, label);
  });

  it('should create error message implicitly (message + error + info)', () => {
    const error = new Error(message);
    const additionalInfo = { key: 'value' };
    const errorMessage = new ErrorMessage(message, error, additionalInfo);

    createLogger(config)(label).debug(message, error, additionalInfo);

    expect(masterLog).to.have.been.calledOnce;
    expect(masterLog).to.have.been.calledWith(LOG_LEVEL.DEBUG, errorMessage, label);
  });

  describe('method alias', () => {
    const logMessage = new LogMessage(message);

    it('should log with ERROR when .error() is called', () => {
      createLogger(config)(label).error(logMessage);

      expect(masterLog).to.have.been.calledOnce;
      expect(masterLog).to.have.been.calledWith(LOG_LEVEL.ERROR, logMessage, label);
    });

    it('should log with WARN when .warn() is called', () => {
      createLogger(config)(label).warn(logMessage);

      expect(masterLog).to.have.been.calledOnce;
      expect(masterLog).to.have.been.calledWith(LOG_LEVEL.WARN, logMessage, label);
    });

    it('should log with INFO when .info() is called', () => {
      createLogger(config)(label).info(logMessage);

      expect(masterLog).to.have.been.calledOnce;
      expect(masterLog).to.have.been.calledWith(LOG_LEVEL.INFO, logMessage, label);
    });

    it('should log with DEBUG when .debug() is called', () => {
      createLogger(config)(label).debug(logMessage);

      expect(masterLog).to.have.been.calledOnce;
      expect(masterLog).to.have.been.calledWith(LOG_LEVEL.DEBUG, logMessage, label);
    });
  });
});
/* eslint-enable no-unused-expressions */
