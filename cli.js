#!/usr/bin/env node

require('v8-compile-cache');

const { DEFAULT_EXTENSIONS } = require('@babel/core');
const rollup = require('rollup');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel');
const postcss = require('rollup-plugin-postcss');
const filesize = require('rollup-plugin-filesize');
const json = require('@rollup/plugin-json');
const replace = require('@rollup/plugin-replace');
const { sizeSnapshot } = require('rollup-plugin-size-snapshot');
const resolve = require('@rollup/plugin-node-resolve');
const { terser } = require('rollup-plugin-terser');
const pkgUp = require('pkg-up');
const ora = require('ora');
const { white, blue, green, bold } = require('kleur');
const fs = require('fs-extra');
const path = require('path');
const cli = require('cac')('shikaka');
const pkg = require('./package.json');

async function buildRollupInputConfig({
  useTypescript,
  input,
  external,
  rootDir,
  bundleReport,
  minify,
  spinner,
  writeMeta,
  sourcemap
}) {
  const componentsPath = path.join(rootDir, path.dirname(input), 'components');
  const files = await fs.readdir(componentsPath);

  const components = await Promise.all(
    files.map(async (name) => {
      const comPath = path.join(componentsPath, name);
      const stat = await fs.stat(comPath);

      let entry = path.join(comPath, 'index.js');
      if (useTypescript) {
        let tsEntry = path.join(comPath, 'index.ts');
        if (await fs.pathExists(entry)) {
          entry = tsEntry;
        } else {
          let tsxEntry = path.join(comPath, 'index.tsx');
          if (await fs.pathExists(tsxEntry)) {
            entry = tsxEntry;
          }
        }
      }

      if (fs.pathExists()) if (!stat.isDirectory()) return null;

      const hasFile = await fs.pathExists(entry);
      if (!hasFile) return null;

      return { name, url: entry };
    })
  );

  const inputs = { index: path.join(rootDir, input) };

  for (const { name, url } of components) {
    inputs[name] = url;
  }

  const orderedInputs = {};
  Object.keys(inputs)
    .sort()
    .forEach(function (key) {
      orderedInputs[key] = inputs[key];
    });

  const inputOptions = {
    input: orderedInputs,
    treeshake: {
      propertyReadSideEffects: false,
      moduleSideEffects: false
    },
    plugins: [
      babel.default({
        exclude: 'node_modules/**',
        cwd: path.resolve(__dirname), // babel plugins are hosted in that package only
        babelHelpers: 'bundled',
        extensions: [...DEFAULT_EXTENSIONS, '.ts', '.tsx'],
        presets: [
          '@babel/preset-react',
          [
            '@babel/preset-env',
            {
              loose: true,
              useBuiltIns: false,
              bugfixes: true,
              modules: false,
              configPath: rootDir,
              exclude: [
                'transform-regenerator',
                'transform-async-to-generator',
                'proposal-object-rest-spread'
              ]
            }
          ],
          ['@babel/preset-typescript', {}]
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
        plugins: [require('postcss-import'), require('postcss-nested'), require('postcss-preset-env')],
        inject: false,
        root: rootDir,
        minimize: minify // cssnano
          ? {
              preset: 'default'
            }
          : false,
        sourceMap: sourcemap,
        modules: {
          generateScopedName: '[folder]__[local]',
          scopeBehaviour: 'local'
        },
        extract: writeMeta ? 'styles.css' : false
      }),
      json(),
      resolve.default({
        extensions: ['.js', '.tsx', '.jsx', '.ts']
      }),
      commonjs(),
      replace({ 'process.env.NODE_ENV': 'production' }),
      minify ? terser() : null,
      {
        generateBundle(options) {
          spinner.stop();
          console.log(blue(`Build ${bold(options.format.toUpperCase())} output to ${options.dir}:`));
        }
      },
      filesize({
        showBrotliSize: true,
        reporter: [
          function (options, bundle, { bundleSize, fileName }) {
            console.log(''.padEnd(6, ' ') + green(bundleSize.padEnd(8, ' ')), white(fileName));
          }
        ]
      }),
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
  .option('--sourcemap', 'Generates sourcemap for CSS and JS', { default: false })
  .option('--format <format>', 'Output format (cjs | umd | es | iife), can be used multiple times', {
    default: ['es']
  })
  .option('--quiet', 'Show minimal logs', { default: false })
  .option('--banner <banner>', 'The file banner')
  .option('--footer <footer>', 'The file footer')
  .example((bin) => `  ${bin} src/index.js`)
  .example((bin) => `  ${bin} src/index.js --format cjs --format esm`)
  .example((bin) => `  ${bin} src/index.js --root-dir packages/ui-library`)
  .action(async (input, options) => {
    await fs.remove(options.outDir);

    const useTypescript = path.extname(input) === '.ts' || path.extname(input) === '.tsx';
    const userPkg = await fs.readJSON(await pkgUp({ cwd: path.resolve(options.rootDir) }));
    const deps = Object.keys(userPkg.dependencies || {});
    const peerDeps = Object.keys(userPkg.peerDependencies || {});
    const allDeps = deps.concat(peerDeps);
    const external = (id) =>
      allDeps.some((name) => id.startsWith(name)) || id.includes(`/node_modules/${id}/`);

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
      sourcemap: options.sourcemap,
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
        useTypescript,
        sizeSnapshot: options.sizeSnapshot,
        sourcemap: options.sourcemap,
        minify: options.minify,
        format,
        writeMeta: i === 0,
        input,
        spinner,
        rootDir: options.rootDir,
        bundleReport: options.report,
        external
      });

      try {
        spinner.text = `Bundle for '${format}`;
        const bundle = await rollup.rollup(inputOptions);
        await bundle.write({ ...outputOptions, format });
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
