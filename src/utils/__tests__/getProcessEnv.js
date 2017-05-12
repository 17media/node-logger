import { getProcessEnv } from '../';

describe('utils/getProcessEnv', () => {
  it('should return process.env variables correctly', () => {
    Object.keys(process.env).forEach((key) => {
      expect(getProcessEnv(key)).toBe(process.env[key]);
    });
  });

  it('should return undefined for missing process.env', () => {
    expect(getProcessEnv('SOMETHING_THAT_DOES_NOT_EXIST')).toBe(undefined);
  });
});
