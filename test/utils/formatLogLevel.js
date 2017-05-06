/* eslint-env node, mocha */
import { expect } from 'chai';
import LogLevel from '../../lib/enum/logLevel';
import { formatLogLevel } from '../../lib/utils';

describe('utils/formatLogLevel', () => {
  it('should format log levels correctly', () => {
    expect(formatLogLevel(LogLevel.ERROR)).to.equal('error');
    expect(formatLogLevel(LogLevel.WARN)).to.equal('warn');
    expect(formatLogLevel(LogLevel.INFO)).to.equal('info');
    expect(formatLogLevel(LogLevel.DEBUG)).to.equal('debug');
  });
});
