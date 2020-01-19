'use strict';

/* eslint-disable max-statements */
const fs = require('fs');
const path = require('path');

const { pass, fail, skip } = require('@tunnckocore/create-jest-runner');
const { isMonorepo } = require('@tunnckocore/utils');

const cosmiconfig = require('cosmiconfig');
const docks = require('./docks.js');

const jestRunnerConfig = cosmiconfig('jest-runner');
const jestRunnerDocks = cosmiconfig('docks');

process.env.NODE_ENV = 'docs';

module.exports = async function jestRunnerDocs({ testPath, config }) {
  const start = new Date();
  const conf = await tryLoadConfig(testPath, start);
  if (conf.hasError) return conf.error;

  const docksConfig = {
    promo: true,
    verbose: false,
    force: true,
    includeHeader: true,
    outfile: 'docs/README.md',
    ...conf,
  };
  docksConfig.outfile = docksConfig.outfile || docksConfig.outFile;

  /** Find correct root path */
  let pkgRoot = isMonorepo(config.cwd)
    ? path.dirname(testPath)
    : config.rootDir;

  /** Handle if index.js is inside root (no src dirs in root of package) */
  pkgRoot = fs.existsSync(path.join(pkgRoot, 'package.json'))
    ? pkgRoot
    : path.dirname(pkgRoot);

  const outfile = await tryCatch(
    () => {
      const { contents: apidocsContent } = docks(testPath, pkgRoot);

      if (apidocsContent.length === 0 && !docksConfig.force) {
        return {
          skip: skip({
            start,
            end: new Date(),
            test: {
              path: testPath,
              title: 'Docks',
            },
          }),
        };
      }

      const outputFile = path.resolve(pkgRoot, docksConfig.outfile);

      const promo = docksConfig.promo
        ? `_Generated using [jest-runner-docs](https://ghub.now.sh/jest-runner-docs)._`
        : '';

      const header = docksConfig.includeHeader ? '## API\n\n' : '';
      const docksStart = '<!-- docks-start -->';
      const docksEnd = '<!-- docks-end -->';
      const cont =
        apidocsContent.length > 0
          ? `\n\n${header}${promo}${apidocsContent}\n\n`
          : '\n';

      const contents = `${docksStart}${cont}${docksEnd}`;

      if (fs.existsSync(outputFile)) {
        const fileContent = fs.readFileSync(outputFile, 'utf8');

        if (
          fileContent.includes(docksStart) &&
          fileContent.includes(docksEnd)
        ) {
          const idxStart = fileContent.indexOf(docksStart);
          const idxEnd = fileContent.indexOf(docksEnd) + docksEnd.length;
          const apiPart = fileContent.slice(idxStart, idxEnd);

          const newContents = fileContent.replace(apiPart, contents);

          fs.writeFileSync(outputFile, newContents);
          return outputFile;
        }

        // probably never gets here
        throw new Error(`Outfile doesn't contain placeholders.`);
      }

      const outDir = path.dirname(outputFile);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(outputFile, contents);
      return outputFile;
    },
    { testPath, start, cfg: docksConfig },
  );

  if (outfile.hasError) return outfile.error;
  if (outfile.skip) return outfile.skip;

  const postHook =
    typeof docksConfig.postHook === 'function'
      ? docksConfig.postHook
      : () => {};

  const res = await tryCatch(
    () =>
      postHook({
        pkgRoot,
        jestConfig: config,
        docksConfig,
        outfile,
        outFile: outfile,
      }),
    { start, testPath, cfg: docksConfig },
  );
  if (res && res.hasError) return res.error;

  return pass({
    start,
    end: new Date(),
    test: {
      path: outfile,
      title: 'Docks',
    },
  });
};

async function tryLoadConfig(testPath, start) {
  return tryCatch(
    () => {
      const cfg = jestRunnerDocks.searchSync();

      if (!cfg || (cfg && !cfg.config)) {
        const runnersConf = jestRunnerConfig.searchSync();

        if (!runnersConf || (runnersConf && !runnersConf.config)) {
          return {};
        }
        return runnersConf.config.docks || runnersConf.config.docs;
      }

      return cfg.config;
    },
    { testPath, start },
  );
}

async function tryCatch(fn, { testPath, start, cfg }) {
  try {
    return await fn();
  } catch (err) {
    if (err.command === 'verb') {
      const errMsg = err.all
        .split('\n')
        .filter((line) => !/\[.+].+/.test(line))
        .join('\n');
      const msg = errMsg.replace(
        /(.*)Error:\s+(.+)/,
        '$1Error: Failure in `verb`, $2',
      );

      return createFailed({ err, testPath, start, cfg }, msg);
    }

    return createFailed({ err, testPath, start, cfg });
  }
}

function createFailed({ err, testPath, start, cfg }, message) {
  const msg =
    cfg && cfg.verbose
      ? message || err.stack || err.message
      : message || 'Some unknown error!';

  return {
    hasError: true,
    error: fail({
      start,
      end: new Date(),
      test: {
        path: testPath,
        title: 'Docks',
        errorMessage: `jest-runner-docs: ${msg}`,
      },
    }),
  };
}

// function tryExtensions(filepath, config) {
//   const { extensions } = getWorkspacesAndExtensions(config.cwd);
//   const hasExtension = path.extname(filepath).length > 0;

//   if (hasExtension) {
//     return filepath;
//   }

//   const extension = extensions.find((ext) => fs.existsSync(filepath + ext));
//   if (!extension) {
//     throw new Error(`Cannot find input file: ${filepath}`);
//   }

//   return filepath + extension;
// }
