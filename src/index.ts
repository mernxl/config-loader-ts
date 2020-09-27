import * as fs from 'fs';
import * as path from 'path';
import { parse as propParser } from 'properties';
import { mergeDeepRight } from 'ramda';

export enum NODE_ENV {
  TEST = 'test',
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
}

/**
 * Synchronously load and parse a properties file.
 * @param propsPath
 * @param vars
 */
export const parseProperties = <PropType = Record<string, any>>(
  propsPath: string,
  vars = {},
): PropType => {
  let config = {};

  const data = fs.readFileSync(path.resolve(propsPath));

  // ensure version of properties doesn't break, this functionality may change
  // it becomes sync since we read the file first
  propParser<PropType>(
    data.toString(),
    { namespaces: true, sections: true, variables: true, vars },
    (err: any, props: Record<string, any>) => {
      if (err) {
        // ensure we don't continue if issues loading vars
        throw err;
      }
      config = props;
    },
  );

  return config as PropType;
};

const loadLocalPoint = <LocalType = Record<string, any>>(
  pointName: string,
  oldVars?: any,
): LocalType | undefined => {
  const paths = pointName.split('.').reverse();

  let vars: LocalType | undefined = undefined;

  // should be at least 2 long
  if (paths.length > 1) {
    const envDepPropsPath = path.resolve(
      [paths[0], 'local', ...paths.slice(1)].reverse().join('.'),
    );

    if (fs.existsSync(envDepPropsPath)) {
      vars = parseProperties<LocalType>(envDepPropsPath, oldVars);
    }
  }

  return vars;
};

/**
 * Used to get properties, changes base on the "NODE_ENV" file.
 *
 * development, production, test, you just need to terminate it with .ini
 *
 * for every point, development, or direct file, it loads
 * app.point.local.ini file
 * it will also load for app.ini, app.local.ini
 *
 * also it must follow convention, if app.ini as base, then app.NODE_ENV.ini
 *
 * Values can be taken from process.env or from the NODE_ENV file,
 * if a referenced variable is not found, then an exception is thrown.
 *
 * @see https://www.npmjs.com/package/properties
 *
 * @param {string} fileName - Form any.properties
 * @param {object} defaults - pass in a defaults var, use if not in process env
 */
export const loadConfig = <
  PropType = Record<string, any>,
  InternalType = Record<string, any>,
  LocalsType = Record<string, any>
>(
  fileName: string,
  defaults?: Partial<PropType>,
): PropType & InternalType & LocalsType => {
  const paths = fileName.split('.');

  let vars = {};
  const NODE_ENV = process.env.NODE_ENV;
  const varsMerger = mergeDeepRight(mergeDeepRight(defaults || {}, process.env));

  // ensure 2 in paths, if 3 or more then its final
  if (NODE_ENV && paths.length === 2) {
    // e.g. app.NODE_ENV.ini
    const pointName = [paths[0], NODE_ENV, paths[1]].join('.');

    const envDepPropsPath = path.resolve(pointName);

    if (fs.existsSync(envDepPropsPath)) {
      vars = parseProperties<InternalType>(envDepPropsPath, varsMerger({}));
    }

    const localPoint = loadLocalPoint<LocalsType>(pointName);
    if (localPoint) {
      vars = mergeDeepRight(vars, localPoint as any);
    }
  }

  vars = varsMerger(vars);

  const requiredLocal = loadLocalPoint<LocalsType>(fileName);

  if (requiredLocal) {
    vars = mergeDeepRight(vars, requiredLocal as any);
  }

  // we only get vars as seen in the fileName file
  return mergeDeepRight(
    mergeDeepRight(vars, parseProperties<PropType>(path.resolve(fileName), vars) as any),
    process.env as any,
  );
};
