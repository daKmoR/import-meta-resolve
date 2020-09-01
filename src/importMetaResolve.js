const path = require('path');
const fs = require('fs');

/**
 * @param {string} resolvePath
 * @param {string} importMetaUrl
 */
function resolveWithBareModule(resolvePath, importMetaUrl) {
  const hasNamespace = resolvePath.includes('@');
  const parts = resolvePath.split(path.sep);
  const pkgName = hasNamespace ? path.join(parts[0], parts[1]) : parts[0];
  parts.shift();
  if (hasNamespace) {
    parts.shift();
  }
  const purePath = path.join(...parts);
  const pkgJson = require.resolve(path.join(pkgName, 'package.json'), {
    paths: [importMetaUrl],
  });
  const pkgRoot = path.dirname(pkgJson);
  return path.join(pkgRoot, purePath);
}

/**
 * @param {string} resolvePath
 * @param {string} importMetaUrl
 */
function resolveRelative(resolvePath, importMetaUrl) {
  return path.join(path.dirname(importMetaUrl), resolvePath);
}

/**
 * Resolves a file/folder path which can contain bare modules.
 *
 * @example
 * await importMetaResolve('@foo/bar/some-folder', import.meta.url);
 * => file:///absolute/path/node_modules/@foo/bar/some-folder
 *
 * await importMetaResolve('@foo/bar', __file);
 * => file:///absolute/path/node_modules/@foo/bar/
 *
 * @param {string} resolvePath Path to resolve
 * @param {string} importMetaUrl Path to the file resolving it relative to
 * @return {Promise<string>} Resolved path
 */
function importMetaResolve(resolvePath, importMetaUrl) {
  if (!resolvePath || !importMetaUrl) {
    throw new Error(
      `importMetaResolve needs exactly 2 parameters - example: importMetaResolve('@foo/bar', import.meta.url) or importMetaResolve('@foo/bar', __file)`,
    );
  }

  return new Promise(resolve => {
    let resolved = '';
    if (resolvePath[0] === '/' || resolvePath[0] === '.') {
      if (resolvePath[0] === '/') {
        resolved = resolvePath;
      } else if (resolvePath[0] === '.') {
        resolved = resolveRelative(resolvePath, importMetaUrl);
      }
      if (fs.existsSync(resolved)) {
        resolve(`file://${resolved}`);
      } else {
        throw new Error(`Cannot find module '${resolvePath}' imported from ${importMetaUrl}`);
      }
    }

    try {
      resolved = resolveWithBareModule(resolvePath, importMetaUrl);
    } catch (err) {
      // try relative again for paths that do not start with `.` like `foo/bar`
      resolved = resolveRelative(resolvePath, importMetaUrl);
    }
    if (fs.existsSync(resolved)) {
      resolve(`file://${resolved}`);
    } else {
      throw new Error(`Cannot find module '${resolvePath}' imported from ${importMetaUrl}`);
    }
  });
}

module.exports = {
  importMetaResolve,
};

// import.meta.resolve
// file:///Users/ff67qn/html/rocket/packages/drawer/package.json
