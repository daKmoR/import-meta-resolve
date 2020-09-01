# import-meta-resolve

Resolve paths in node when using es modules (or commonjs). Ponyfill for `import.meta.resolve` as it is behind a flag.

## Installation

```
npm i import-meta-resolve
```

## Features

- can be used in node using es modules & commonjs
- resolves folders (`require.resolve` dos not support it)
- mimics `import.meta.url` so can hopefully be replaced by it once it is no longer behind a flag

## Usage

```js
import { importMetaResolve } from 'import-meta-resolve';

await importMetaResolve('@foo/bar/some-folder', import.meta.url);
// file:///absolute/path/node_modules/@foo/bar/some-folder

await importMetaResolve('@foo/bar', import.meta.url);
// file:///absolute/path/node_modules/@foo/bar/

await importMetaResolve('@foo/bar/some-file.js', import.meta.url);
// file:///absolute/path/node_modules/@foo/bar/some-file.js

await importMetaResolve('./foo.js', import.meta.url);
// file:///absolute/path/to/file/foo.js
```

### Will throw if file could not be resolved

```js
try {
  await importMetaResolve('@foo/bar/non-existing-file.js', import.meta.url);
} catch (error) {
  // Cannot find module '@foo/bar/non-existing-file.js' imported from /absolute/path/to/current/file.js
}
```

## Usage CommonJs

```js
const { importMetaResolve } = require('import-meta-resolve');

await importMetaResolve('@foo/bar/some-folder', __file);
// file:///absolute/path/node_modules/@foo/bar/some-folder
```

## Motivation

`require.resolve` enables you to resolve package files which can be useful if you need to manually load or check for files in packages.
However when using es modules in node `require.resolve` is [not allowed](https://nodejs.org/api/esm.html).
Which means there is currently no replacement for this functionality.
There is however an experimental api `import.meta.resolve` which you can enable via a cli flag `--experimental-import-meta-resolve`.
Experimental flags are however tough to integrate everywhere bins, other tools, ... and additionally it is tough to explain to your users that the have to do this.

Because of this a transition package like this may be useful.
