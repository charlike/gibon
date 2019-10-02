/* eslint-disable import/no-extraneous-dependencies */
const builtins = require('builtin-modules');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

const fs = require('fs');
const path = require('path');

const tunnckocoreInterop = `const ___exportsWithoutDefault = Object.keys(exports)
  .filter((x) => x !== 'default')
  .reduce((acc, key) => {
    acc[key] = exports[key];
    return acc;
  }, {});

module.exports = Object.assign(exports.default, ___exportsWithoutDefault);
`;

module.exports = {
  pkgHook: ({ pkgRoot, output }) => {
    const {
      name,
      version,
      description,
      license,
      author,
      engines,
      keywords,
      repository,
      dependencies,
      peerDependencies,
    } = JSON.parse(fs.readFileSync(path.join(pkgRoot, 'package.json'), 'utf8'));

    const pkg = {
      name,
      version,
      description,
      license,
      author,
      engines,
      keywords,
      repository,
      dependencies,
      peerDependencies,
      files: output.map(({ format }) => format),
      main: output.find(({ format }) => format === 'cjs').file,
      module: output.find(({ format }) => format === 'esm').file,
      typings: 'dist/types/index.d.ts',
    };

    const pkgJson = Object.keys(pkg).reduce((acc, key) => {
      if (pkg[key]) {
        acc[key] = pkg[key];
      }
      return acc;
    }, {});

    fs.writeFileSync(
      path.join(pkgRoot, 'dist', 'package.json'),
      JSON.stringify(pkgJson, null, 2),
    );
  },

  external: builtins,
  inlineDynamicImports: true,
  experimentalTopLevelAwait: true,
  plugins: [
    nodeResolve({
      preferBuiltins: true,
      mainFields: ['module', 'main'],
    }),
    commonjs({
      // extensions,
    }),
  ],
  output: [
    {
      exports: 'named',
      outro: tunnckocoreInterop,
      esModule: false,
      preferConst: true,
      format: 'cjs',
      // file: 'builds/index.cjs.js',
    },
    {
      preferConst: true,
      format: 'esm',
      // file: 'builds/index.esm.js',
    },
  ],
};
