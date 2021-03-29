# configu
[![npm](https://img.shields.io/npm/v/@xelgrp/configu.svg)](https://www.npmjs.com/package/@xelgrp/configu)
[![codecov](https://codecov.io/gh/mernxl/configu/branch/master/graph/badge.svg?token=CDR05VIYIX)](https://codecov.io/gh/mernxl/configu)
[![Dependencies State](https://david-dm.org/mernxl/configu.svg)](https://david-dm.org/mernxl/configu)
![TypeScript compatible](https://img.shields.io/badge/typescript-compatible-brightgreen.svg)
[![Code Style Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

A node JS env and configuration loader with typescript support. Build in support to load with respect to your environment, dev, prod etc

## Installation
```
yarn add @xelgrp/configu
or
npm install @xelgrp/configu
```

### Clearer Docs TODO
This package currently supports loading [`properties`](https://www.npmjs.com/package/properties) files.

NOTE: This library supports configuration files that must be terminated by the extensions to determine its type.
* **.ini, .properties**: Properties files
* **.yml, .yaml**: Yaml files (Coming Soon)
* **.json**: Json configuration files (Coming Soon) 

To load a configuration;
```typescript
import { loadConfig } from '@xelgrp/configu';

interface AppConfig {
  host: string;
  port: string;
  dbPass?: string;
  dbUser: string;
}

const defaultConfigs = {
  host: 'localhost',
  port: 4040,
  dbUser: 'root'
}

// export function to use in loading later
export const getConfig = (): AppConfig => loadConfig<AppConfig>('app.ini', defaultConfigs);

export const config = getConfig();
```

This package loads Configurations in such a way that, the previous config will serve as variables for the next,
override fields in next config file or will become additional fields in the configuration

Considering an `app.ini` configurations to load, variable loading takes place in the following order;
* process.env -> app.development.local.ini -> app.development.ini -> app.local.ini -> app.ini & process.env
* process.env -> app.production.local.ini -> app.production.ini -> app.local.ini -> app.ini & process.env
* process.env -> app.test.local.ini -> app.test.ini -> app.local.ini -> app.ini & process.env

Configuration variables are loaded from the `app.**.ini` files in such a way as to match the current environment.
E.g. When `NODE_ENV=development`, the `app.development.ini` files are loaded along side the `app.ini` file and 
environment variables. 

The NODE_ENV can be changed by any file by setting the NODE_ENV variable. This NODE_ENV variable always defaults to 
`development`.

process.env is loaded at the start to serve as variables for next configurations, it is again loaded at the end together 
with the base file so if it was overwritten along the load chain, it will still serve as a final source of truth.

Usually you would not want to commit your `.local.` files as they may contain variables that do not need committing, 
like usernames and passwords normally you will pass them through environment variables at deployment.

NOTE: All config files must be one directory

### License
This project is MIT Licensed - see the LICENSE.md file for details
