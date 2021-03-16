import { clone, pick } from 'ramda';

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

  it('should parse according to var type from .ini files', () => {
    expect(
      pick(
        ['BOOLEAN_TRUE', 'NUMBER_FIELD', 'STRING_FIELD'],
        loadConfig('__mocks__/properties1/app.ini'),
      ),
    ).toMatchObject({
      BOOLEAN_TRUE: true,
      NUMBER_FIELD: 1,
      STRING_FIELD: 'True',
    });
  });

  describe('load order', () => {
    beforeAll(() => {
      process.env.CHANGED_VAR = 'Changed in process.env';
    });

    it('should parse correctly', () => {
      expect(loadConfig('__mocks__/properties1/app.ini').CHANGED_VAR).toMatchSnapshot();
    });
  });

  describe('load order 2', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should parse correct order of local files, dev', () => {
      process.env.NODE_ENV = 'development';
      expect(
        pick(
          ['SOME_VAR', 'GLOBAL_ENV_VAR', 'VAR_IN_PROD'],
          loadConfig('__mocks__/properties2/app.ini'),
        ),
      ).toMatchSnapshot();
    });

    it('should parse correct order of local files, production', () => {
      expect(
        pick(
          ['SOME_VAR', 'GLOBAL_ENV_VAR', 'VAR_IN_PROD'],
          loadConfig('__mocks__/properties2/app.ini'),
        ),
      ).toMatchSnapshot();
    });
  });
});
