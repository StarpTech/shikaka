const fs = require('fs-extra');
const { resolve, relative } = require('path');
const dirTree = require('directory-tree');
const execa = require('execa');

const FIXTURES_DIR = `${__dirname}/fixtures`;
const DEFAULT_SCRIPT = 'node';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const join = (arr, delimiter = '') => arr.join(delimiter);
const printTree = (nodes, indentLevel = 0) => {
  const indent = '  '.repeat(indentLevel);
  return join(
    nodes
      .filter((node) => node.name[0] !== '.')
      .map((node) => {
        const isDir = node.type === 'directory';
        return `${indent}${node.name}\n${isDir ? printTree(node.children, indentLevel + 1) : ''}`;
      })
  );
};

describe('fixtures', () => {
  const dirs = fs
    .readdirSync(FIXTURES_DIR)
    .filter((fixturePath) => fs.statSync(resolve(FIXTURES_DIR, fixturePath)).isDirectory());

  it.each(dirs)('build %s with shikaka', async (fixtureDir) => {
    let fixturePath = resolve(FIXTURES_DIR, fixtureDir);

    await sleep(1);

    const entry = relative(process.cwd(), resolve(fixturePath, 'src', 'index.js'));
    const outDir = relative(process.cwd(), `${fixturePath}/dist`);
    const scriptArgs = ['cli.js', entry, '--out-dir', outDir];
    await execa(DEFAULT_SCRIPT, scriptArgs);

    await sleep(1);

    const printedDir = printTree([dirTree(fixturePath)]);

    expect(
      [
        `Used script: ${DEFAULT_SCRIPT} ${scriptArgs.join(' ')}`,
        'Directory tree:',
        printedDir,
      ].join('\n\n')
    ).toMatchSnapshot();

    const dist = resolve(`${fixturePath}/dist`);
    const files = await fs.readdir(resolve(dist));
    expect(files.length).toMatchSnapshot();

    // we don't realy care about the content of a sourcemap
    files
      .filter((file) => !/\.map$/.test(file) && !fs.lstatSync(resolve(dist, file)).isDirectory())
      .forEach((file) => {
        expect(fs.readFileSync(resolve(dist, file)).toString('utf8')).toMatchSnapshot();
      });
  });
});
