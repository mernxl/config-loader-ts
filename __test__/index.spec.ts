import { clone } from 'ramda';

import { loadConfig, NODE_ENV } from '../src';

const initialProcessEnv = clone(process.env);

describe('loadConfig', () => {
  beforeEach(() => {
    process.env = initialProcessEnv;
    process.env.NODE_ENV = NODE_ENV.DEVELOPMENT;
  });

  it('should parse correctly', () => {
    expect(loadConfig('__mocks__/properties1/app.ini').CHANGED_VAR).toMatchSnapshot();
  });

  it('should parse correctly files starting with dot', () => {
    expect(loadConfig('__mocks__/properties1/.app.ini').CHANGED_VAR).toMatchSnapshot();
  });

  describe('load order', () => {
    beforeEach(() => {
      process.env.CHANGED_VAR = 'Changed in process.env';
    });

    it('should parse correctly', () => {
      expect(loadConfig('__mocks__/properties1/app.ini').CHANGED_VAR).toMatchSnapshot();
    });
  });
});
