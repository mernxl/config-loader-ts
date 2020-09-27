# configu
[![npm](https://img.shields.io/npm/v/@xelgrp/configu.svg)](https://www.npmjs.com/package/@xelgrp/configu)
![TypeScript compatible](https://img.shields.io/badge/typescript-compatible-brightgreen.svg)
[![Code Style Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Dependencies State](https://david-dm.org/mernxl/configu.svg)](https://david-dm.org/mernxl/configu)

A node JS env and configuration loader with typescript support. Build in support to load with respect to your environment, dev, prod etc

## Installation
```
yarn add @xelgrp/configu
or
npm install @xelgrp/configu
```

#### Documentation TODO
Used to get properties, changes base on the `NODE_ENV` file. development, production, test, you just need to terminate it with .ini
for every point, development, or direct file, it loads app.point.local.ini file it will also load for app.ini, app.local.ini
also it must follow convention, if app.ini as base, then app.NODE_ENV.ini Values can be taken from process.env or from the NODE_ENV file,
if a referenced variable is not found, then an exception is thrown.

This package currently supports loading [`properties`](https://www.npmjs.com/package/properties) files.

### License
This project is MIT Licensed - see the LICENSE.md file for details
