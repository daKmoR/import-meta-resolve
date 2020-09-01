const { expect } = require('chai');
const { importMetaResolve } = require('../src/importMetaResolve.js');

async function expectThrowsAsync(method, { equal = '', match = false } = {}) {
  let error = null;
  try {
    await method();
  } catch (err) {
    error = err;
  }
  expect(error).to.be.an('Error', 'No error was thrown');
  if (equal) {
    expect(error.message).to.equal(equal);
  }
  if (match) {
    expect(error.message).to.match(match);
  }
}

describe('importMetaResolve', () => {
  it('resolves a package.json', async () => {
    const resolved = await importMetaResolve('@foo/bar/package.json', __filename);
    expect(resolved).to.match(/test\/node_modules\/@foo\/bar\/package.json$/);
    expect(resolved.startsWith('file://')).to.be.true;
  });

  it('resolves a bare module to its folder', async () => {
    const resolved = await importMetaResolve('@foo/bar', __filename);
    expect(resolved).to.match(/test\/node_modules\/@foo\/bar$/);
    expect(resolved.startsWith('file://')).to.be.true;
  });

  it('resolves a bare module sub folder', async () => {
    const resolved = await importMetaResolve('@foo/bar/foo-bar-subfolder', __filename);
    expect(resolved).to.match(/test\/node_modules\/@foo\/bar\/foo-bar-subfolder$/);
    expect(resolved.startsWith('file://')).to.be.true;
  });

  it('resolves relative urls', async () => {
    const resolved = await importMetaResolve('./fixture/fixtureFile.js', __filename);
    expect(resolved).to.match(/test\/fixture\/fixtureFile.js$/);
    expect(resolved.startsWith('file://')).to.be.true;
  });

  it('resolves relative urls not starting with a dot', async () => {
    const resolved = await importMetaResolve('fixture/fixtureFile.js', __filename);
    expect(resolved).to.match(/test\/fixture\/fixtureFile.js$/);
    expect(resolved.startsWith('file://')).to.be.true;
  });

  it('resolves absolute urls', async () => {
    const resolved = await importMetaResolve('/', __filename);
    expect(resolved).to.equal('file:///');
  });

  it('throws if not exactly 2 parameters are passed on', async () => {
    await expectThrowsAsync(() => importMetaResolve(), {
      equal: `importMetaResolve needs exactly 2 parameters - example: importMetaResolve('@foo/bar', import.meta.url) or importMetaResolve('@foo/bar', __file)`,
    });
    await expectThrowsAsync(() => importMetaResolve('@foo/bar'), {
      equal: `importMetaResolve needs exactly 2 parameters - example: importMetaResolve('@foo/bar', import.meta.url) or importMetaResolve('@foo/bar', __file)`,
    });
  });

  it('throws if no resolution of the file failed', async () => {
    await expectThrowsAsync(() => importMetaResolve('/foo', __filename), {
      match: /^Cannot find module '\/foo' imported from(.*)importMetaResolve.test.js$/,
    });
    await expectThrowsAsync(() => importMetaResolve('./foo', __filename), {
      match: /^Cannot find module '.\/foo' imported from(.*)importMetaResolve.test.js$/,
    });
    await expectThrowsAsync(() => importMetaResolve('foo', __filename), {
      match: /^Cannot find module 'foo' imported from(.*)importMetaResolve.test.js$/,
    });
    await expectThrowsAsync(() => importMetaResolve('@foo/baz', __filename), {
      match: /^Cannot find module '@foo\/baz' imported from(.*)importMetaResolve.test.js$/,
    });
    await expectThrowsAsync(() => importMetaResolve('@foo/bar/baz', __filename), {
      match: /^Cannot find module '@foo\/bar\/baz' imported from(.*)importMetaResolve.test.js$/,
    });
  });
});
