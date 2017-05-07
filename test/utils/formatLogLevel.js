/* eslint-env node, mocha */
import { expect } from 'chai';
import Level from '../../lib/enum/level';
import { formatLogLevel } from '../../lib/utils';

describe('utils/formatLogLevel', () => {
  it('should format log levels correctly', () => {
    expect(formatLogLevel(Level.FATAL)).to.equal('fatal');
    expect(formatLogLevel(Level.ERROR)).to.equal('error');
    expect(formatLogLevel(Level.WARN)).to.equal('warn');
    expect(formatLogLevel(Level.INFO)).to.equal('info');
    expect(formatLogLevel(Level.DEBUG)).to.equal('debug');
  });
});
