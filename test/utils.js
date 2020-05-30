const fs = require('fs-extra');
const { resolve, relative, basename, extname } = require('path');
const dirTree = require('directory-tree');
const execa = require('execa');

const FIXTURES_DIR = `${__dirname}/fixtures`;
const DEFAULT_SCRIPT = 'node';
const babelHelpersRegex = /_rollupPluginBabelHelpers-[a-z0-9]+\.js/;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const join = (arr, delimiter = '') => arr.join(delimiter);

const printTree = (nodes, indentLevel = 0) => {
    const indent = '  '.repeat(indentLevel);
    return join(
      nodes
        .filter((node) => !babelHelpersRegex.test(node.name) && node.name[0] !== '.')
        .map((node) => {
          const isDir = node.type === 'directory';
          return `${indent}${node.name}\n${isDir ? printTree(node.children, indentLevel + 1) : ''}`;
        })
    );
  };

module.exports.prepareLibraryTest = async (fixtureDir) => {
  let fixturePath = relative(process.cwd(), resolve(FIXTURES_DIR, fixtureDir));

  await sleep(1);

  const entry = relative(fixturePath, resolve(fixturePath, 'src', 'index.js'));
  const outDir = relative(process.cwd(), `${fixturePath}/dist`);
  const scriptArgs = ['cli.js', entry, '--out-dir', outDir, '--root-dir', fixturePath];

  await execa(DEFAULT_SCRIPT, scriptArgs);

  await sleep(1);

  const printedDir = printTree([dirTree(fixturePath)]);

  expect(
    [`Used script: ${DEFAULT_SCRIPT} ${scriptArgs.join(' ')}`, 'Directory tree:', printedDir].join('\n\n')
  ).toMatchSnapshot();

  const dist = resolve(`${fixturePath}/dist`);
  const files = await fs.readdir(resolve(dist));
  expect(files.length).toMatchSnapshot();

  const filteredFiles = files.filter(
    (file) =>
      !babelHelpersRegex.test(file) &&
      !/\.map$/.test(file) &&
      !fs.lstatSync(resolve(dist, file)).isDirectory()
  );

  const fileMap = {};
  for (const file of filteredFiles) {
    fileMap[basename(file, extname(file))] = fs.readFileSync(resolve(dist, file)).toString('utf8');
  }

  return { files: fileMap };
};
