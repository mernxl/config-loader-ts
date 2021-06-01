import * as fs from 'fs';
import * as path from 'path';
import { parse as propParser } from 'properties';
import { mergeDeepRight } from 'ramda';

export enum NODE_ENV {
  TEST = 'test',
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
}

export type DefaultConfigType = Record<string, any>;

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

const resolveFilePath = (filePath: string): string[] => {
  let filename, basePath;

  const lastIndex = filePath.lastIndexOf('/');

  if (lastIndex > -1) {
    filename = filePath.slice(lastIndex + 1);
    basePath = filePath.slice(0, lastIndex + 1);
  } else {
    filename = filePath;
    basePath = '';
  }

  // lets skip initial .
  const fileNameParts = (filename.startsWith('.') ? filename.slice(1) : filename).split('.');
  if (filename.startsWith('.')) {
    basePath += `.${fileNameParts[0]}`;
  } else {
    basePath += fileNameParts[0];
  }

  // basePath contains up to where we can add NodeEnv, i.e. ../.app
  return [basePath, ...fileNameParts.slice(1)];
};

const loadLocalPoint = <LocalType = DefaultConfigType>(
  pointPath: string,
  oldVars: DefaultConfigType,
): LocalType | undefined => {
  const paths = resolveFilePath(pointPath).reverse();

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
 * Function to load configuration files
 *
 * Check out [README.md](https://github.com/mernxl/configu#readme) File for more information.
 *
 * @see https://www.npmjs.com/package/properties
 *
 * @param {string} filePath - path to file
 * @param {object} defaults - pass in a defaults var, use if not in process env
 */
export function loadConfig<
  PropType = DefaultConfigType,
  InternalType = DefaultConfigType,
  LocalsType = DefaultConfigType
>(
  filePath: string,
  defaults?: Partial<PropType>,
): PropType & InternalType & LocalsType & NodeJS.ProcessEnv {
  const paths = resolveFilePath(filePath);

  const currentNODE_ENV = process.env.NODE_ENV || NODE_ENV.DEVELOPMENT;

  let vars: Record<string, any> = mergeDeepRight<DefaultConfigType, DefaultConfigType>(
    defaults || {},
    process.env,
  );

  // ensure 2 in paths, if 3 or more then its final
  if (currentNODE_ENV && paths.length === 2) {
    // e.g. app.NODE_ENV.ini
    const pointName = [paths[0], currentNODE_ENV, paths[1]].join('.');
    const envDepPropsPath = path.resolve(pointName);

    // load local
    const localPoint = loadLocalPoint<LocalsType>(pointName, vars);
    if (localPoint) {
      vars = mergeDeepRight(vars, localPoint as any);
    }

    // load env file
    if (fs.existsSync(envDepPropsPath)) {
      vars = mergeDeepRight(vars, parseProperties<InternalType>(envDepPropsPath, vars) as any);
    }
  }

  // required file's local
  const requiredLocal = loadLocalPoint<LocalsType>(filePath, vars);
  if (requiredLocal) {
    vars = mergeDeepRight(requiredLocal as any, vars);
  }

  // we only get vars as seen in the fileName file
  vars = mergeDeepRight(
    parseProperties<PropType>(path.resolve(filePath), mergeDeepRight(vars, process.env)) as any,
    vars,
  );

  return mergeDeepRight(vars, process.env as any);
}
