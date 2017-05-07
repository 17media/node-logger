/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chai from 'chai';

import { LogMessage } from '../lib/message';
import { SlackLogger, FluentdLogger, ConsoleLogger } from '../lib/service';
import LOG_LEVEL from '../lib/enum/logLevel';
import Logger from '../lib/logger';

const { expect } = chai;

chai.use(sinonChai);

describe('logger', () => {
  describe('config', () => {
    it('should accept object', () => {
      expect(() => new Logger({ key: 'value' })).to.not.throw('invalid config');
    });

    it('should not accept string', () => {
      expect(() => new Logger('not object')).to.throw('invalid config');
    });

    it('should not accept integer', () => {
      expect(() => new Logger(1)).to.throw('invalid config');
    });

    it('should not accept null', () => {
      expect(() => new Logger(null)).to.throw('invalid config');
    });

    it('should not accept array', () => {
      expect(() => new Logger([3, 4, 5])).to.throw('invalid config');
    });

    it('should initiate proper services according to config', () => {
      const slackConfigCheck = sinon.spy(SlackLogger.prototype, 'IsConfigValid');
      const fluentdConfigCheck = sinon.spy(FluentdLogger.prototype, 'IsConfigValid');
      const consoleConfigCheck = sinon.spy(ConsoleLogger.prototype, 'IsConfigValid');

      const config = {
        base: {
          project: 'cool project',
          environment: 'production',
        },
        SlackLogger: {
          minLogLevel: LOG_LEVEL.DEBUG,
          slackToken: 'token',
          slackChannel: 'slack channel',
        },
        // disable console logger
        ConsoleLogger: false,
        // fluentd logger config is missing
      };

      const logger = new Logger(config);

      expect(logger.services).to.have.length(1);
      expect(logger.services[0]).to.be.an.instanceof(SlackLogger);
      expect(logger.services[0].config).to.deep.equals(
        Object.assign({}, config.base, config.SlackLogger));
      expect(slackConfigCheck).to.have.been.calledOnce;
      expect(fluentdConfigCheck).to.not.have.been.called;
      expect(consoleConfigCheck).to.not.have.been.called;

      slackConfigCheck.restore();
      fluentdConfigCheck.restore();
      consoleConfigCheck.restore();
    });
  });

  describe('logging', () => {
    const message = 'something happened';
    const label = 'some:label';
    let slackLog;
    let fluentdLog;
    let consoleLog;
    let config;

    beforeEach(() => {
      slackLog = sinon.stub(SlackLogger.prototype, 'Log').returns(Promise.resolve());
      fluentdLog = sinon.stub(FluentdLogger.prototype, 'Log').returns(Promise.resolve());
      consoleLog = sinon.stub(ConsoleLogger.prototype, 'Log').returns(Promise.resolve());

      config = {
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
    });

    afterEach(() => {
      slackLog.restore();
      fluentdLog.restore();
      consoleLog.restore();
    });

    it('should call each service and pass through message', () => {
      const logger = new Logger(config);

      logger.Log(LOG_LEVEL.ERROR, new LogMessage(message), label);

      expect(logger.services).to.have.length(3);
      expect(slackLog).to.have.been.calledOnce;
      expect(slackLog).to.have.been.calledWith(LOG_LEVEL.ERROR, new LogMessage(message), label);
      expect(fluentdLog).to.have.been.calledOnce;
      expect(fluentdLog).to.have.been.calledWith(LOG_LEVEL.ERROR, new LogMessage(message), label);
      expect(consoleLog).to.have.been.calledOnce;
      expect(consoleLog).to.have.been.calledWith(LOG_LEVEL.ERROR, new LogMessage(message), label);
    });

    it('should skip services with incomplete config', () => {
      const slackConfigCheck = sinon.stub(SlackLogger.prototype, 'IsConfigValid').returns(false);

      const logger = new Logger(config);

      logger.Log(LOG_LEVEL.ERROR, new LogMessage(message), label);

      expect(logger.services).to.have.length(2);
      expect(slackLog).to.not.have.been.called;
      expect(fluentdLog).to.have.been.calledOnce;
      expect(fluentdLog).to.have.been.calledWith(LOG_LEVEL.ERROR, new LogMessage(message), label);
      expect(consoleLog).to.have.been.calledOnce;
      expect(consoleLog).to.have.been.calledWith(LOG_LEVEL.ERROR, new LogMessage(message), label);

      slackConfigCheck.restore();
    });

    it('should partially disable some services depending on log level', () => {
      const logger = new Logger(config);

      logger.Log(LOG_LEVEL.WARN, new LogMessage(message), label);

      expect(logger.services).to.have.length(3);
      expect(slackLog).to.not.have.been.called;
      expect(fluentdLog).to.have.been.calledOnce;
      expect(fluentdLog).to.have.been.calledWith(LOG_LEVEL.WARN, new LogMessage(message), label);
      expect(consoleLog).to.have.been.calledOnce;
      expect(consoleLog).to.have.been.calledWith(LOG_LEVEL.WARN, new LogMessage(message), label);
    });

    it('should be able to preset label and pass through message', () => {
      const logger = new Logger(config).Label(label);

      logger.Log(LOG_LEVEL.WARN, new LogMessage(message));

      expect(slackLog).to.not.have.been.called;
      expect(fluentdLog).to.have.been.calledOnce;
      expect(fluentdLog).to.have.been.calledWith(LOG_LEVEL.WARN, new LogMessage(message), label);
      expect(consoleLog).to.have.been.calledOnce;
      expect(consoleLog).to.have.been.calledWith(LOG_LEVEL.WARN, new LogMessage(message), label);
    });
  });
});
/* eslint-enable no-unused-expressions */
