#!/usr/bin/env node

require('v8-compile-cache');

const rollup = require('rollup');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel');
const postcss = require('rollup-plugin-postcss');
const json = require('@rollup/plugin-json');
const replace = require('@rollup/plugin-replace');
const { sizeSnapshot } = require('rollup-plugin-size-snapshot');
const { terser } = require('rollup-plugin-terser');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');
const cli = require('cac')('shikaka');
const pkg = require('./package.json');

async function buildRollupInputConfig({ input, external, rootDir, bundleReport, minify, writeMeta }) {
  const componentsPath = path.join(path.dirname(input), 'components');
  const files = await fs.readdir(componentsPath);
  const components = await Promise.all(
    files.map(async (name) => {
      const comPath = path.join(componentsPath, name);
      const entry = path.join(comPath, 'index.js');

      const stat = await fs.stat(comPath);
      if (!stat.isDirectory()) return null;

      const hasFile = await fs.pathExists(entry);
      if (!hasFile) return null;

      return { name, url: entry };
    })
  );

  const inputs = { index: path.join(rootDir, input) };

  for (const { name, url } of components) {
    inputs[name] = url;
  }

  const inputOptions = {
    input: inputs,
    treeshake: {
      propertyReadSideEffects: false,
      moduleSideEffects: false
    },
    plugins: [
      babel.default({
        exclude: 'node_modules/**',
        babelHelpers: 'bundled',
        presets: [
          '@babel/preset-react',
          [
            '@babel/preset-env',
            {
              loose: true,
              useBuiltIns: false,
              bugfixes: true,
              modules: false,
              exclude: [
                'transform-regenerator',
                'transform-async-to-generator',
                'proposal-object-rest-spread'
              ]
            }
          ]
        ],
        plugins: [
          [
            'babel-plugin-transform-replace-expressions',
            {
              replace: {
                'process.env.NODE_ENV': '"production"'
              }
            }
          ],
          [
            '@babel/plugin-proposal-object-rest-spread',
            {
              useBuiltIns: true,
              loose: true
            }
          ],
          '@babel/plugin-proposal-optional-chaining',
          '@babel/plugin-proposal-nullish-coalescing-operator'
        ]
      }),
      postcss({
        extensions: ['.css', '.scss'],
        plugins: [
          require('postcss-import'),
          require('postcss-nested'),
          require('postcss-preset-env'),
          minify ? require('cssnano') : null
        ].filter((p) => !!p),
        inject: false,
        modules: {
          generateScopedName: '[folder]__[local]',
          scopeBehaviour: 'local'
        },
        extract: !!writeMeta
      }),
      json(),
      commonjs(),
      replace({ 'process.env.NODE_ENV': 'production' }),
      minify ? terser() : null,
      bundleReport ? sizeSnapshot({ printInfo: false }) : null
    ].filter((p) => !!p),
    external
  };

  return {
    inputOptions
  };
}

cli
  .command('<input>', 'Library entry file')
  .option('--root-dir <rootDir>', 'The root directory to resolve files from', {
    default: '.'
  })
  .option('--out-dir <outDir>', 'Output directory', { default: 'dist' })
  .option('--minify', 'Minify CSS and JS output files', { default: false })
  .option('--report', 'Generates a report about your bundle size', { default: false })
  .option('--format <format>', 'Output format (cjs | umd | es | iife), can be used multiple times', {
    default: ['es']
  })
  .option('--quiet', 'Show minimal logs', { default: false })
  .option('--banner <banner>', 'The file banner')
  .option('--footer <footer>', 'The file footer')
  .example((bin) => `  ${bin} src/index.js`)
  .example((bin) => `  ${bin} src/index.js --format cjs --format esm`)
  .example((bin) => `  ${bin} src/index.js --root-dir packages/ui-library`)
  .example((bin) => `  ${bin} src/index.js --css-file-name theme.css`)
  .action(async (input, options) => {
    await fs.remove(options.outDir);
    const userPkg = await fs.readJSON(path.resolve(options.rootDir, 'package.json'));

    const deps = Object.keys(userPkg.dependencies).concat(Object.keys(userPkg.peerDependencies));
    const external = (x) => deps.some((y) => x.startsWith(y));
    const formats = Array.isArray(options.format) ? options.format : [options.format];
    const singleFormat = formats.length === 1;

    const globals = {
      react: 'React',
      'react-dom': 'ReactDOM'
    };

    const esOutput = {
      dir: options.outDir,
      entryFileNames: `${!singleFormat ? '[format]/' : ''}[name].js`,
      chunkFileNames: `${!singleFormat ? '[format]/' : ''}[name]-[hash].js`,
      banner: options.banner,
      footer: options.footer,
      freeze: false,
      esModule: false,
      globals
    };
    const outputOptions = {
      ...esOutput,
      minifyInternalExports: false // for better readability
    };

    const spinner = ora('Bundling').start();
    for (let i = 0; i < formats.length; i++) {
      const format = formats[i];
      // create a bundle
      const { inputOptions } = await buildRollupInputConfig({
        sizeSnapshot: options.sizeSnapshot,
        minify: options.minify,
        format,
        writeMeta: i === 0,
        input,
        rootDir: options.rootDir,
        bundleReport: options.report,
        external
      });

      try {
        const bundle = await rollup.rollup(inputOptions);
        spinner.text = `Bundle for '${format}'`;
        // or write the bundle to disk
        await bundle.write({ ...outputOptions, format });
        spinner.stop();
      } catch (error) {
        spinner.color = 'red';
        spinner.fail(error.message);
        if (!options.quiet) {
          console.error(error);
        }
        process.exit(1);
      }
    }
  });

cli.version(pkg.version);
cli.help();

cli.parse();

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});
