#!/usr/bin/env node

require('v8-compile-cache');

const tryRequire = require('try-require');
const rollup = require('rollup');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel');
const postcss = require('rollup-plugin-postcss');
const filesize = require('rollup-plugin-filesize');
const json = require('@rollup/plugin-json');
const replace = require('@rollup/plugin-replace');
const { sizeSnapshot } = require('rollup-plugin-size-snapshot');
const nodeResolve = require('@rollup/plugin-node-resolve');
const typescript = tryRequire('rollup-plugin-typescript2');
const { terser } = require('rollup-plugin-terser');
const pkgUp = require('pkg-up');
const ora = require('ora');
const { white, blue, green, bold } = require('kleur');
const fs = require('fs-extra');
const path = require('path');
const cli = require('cac')('shikaka');
const pkg = require('./package.json');

// Extensions to use when resolving modules
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.es6', '.es', '.mjs'];

async function buildRollupInputConfig({
  tsConfig,
  cssModules,
  replacedStrings,
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
  const resolvedRoot = path.resolve(rootDir);
  const componentsPath = path.join(resolvedRoot, path.dirname(input), 'components');
  let components = [];

  if (await fs.exists(componentsPath)) {
    const files = await fs.readdir(componentsPath);
    components = await Promise.all(
      files.map(async (name) => {
        const comPath = path.join(componentsPath, name);

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

        const hasFile = await fs.pathExists(entry);
        if (!hasFile) return null;

        return { name, url: entry };
      })
    );
  }

  const inputs = { index: path.join(resolvedRoot, input) };

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
      replace({ ...replacedStrings, 'process.env.NODE_ENV': 'production' }),
      json(),
      nodeResolve.default({
        mainFields: ['module', 'jsnext', 'main'],
        extensions: ['.js', '.tsx', '.jsx', '.ts', '.mjs', '.json', '.node']
      }),
      postcss({
        plugins: [require('postcss-import'), require('postcss-nested'), require('postcss-preset-env')],
        inject: false,
        root: resolvedRoot,
        minimize: minify // cssnano
          ? {
              preset: 'default'
            }
          : false,
        sourceMap: sourcemap,
        modules: cssModules
          ? {
              generateScopedName: typeof cssModules === 'string' ? cssModules : '[folder]__[local]',
              scopeBehaviour: 'local'
            }
          : false,
        extract: writeMeta ? 'styles.css' : false
      }),
      useTypescript && typescript && tryRequire.resolve('typescript')
        ? typescript({
            cwd: resolvedRoot,
            tsConfig,
            tsconfigDefaults: {
              compilerOptions: {
                declaration: true,
                sourceMap: sourcemap,
                jsx: 'react',
                allowSyntheticDefaultImports: true
              }
            },
            tsconfigOverride: {
              compilerOptions: {
                module: 'ESNext',
                target: 'esnext'
              }
            }
          })
        : null,
      babel.default({
        exclude: '/**/node_modules/**',
        cwd: path.resolve(__dirname), // babel plugins are hosted in that package only
        babelHelpers: 'bundled',
        extensions: EXTENSIONS,
        babelrc: false,
        configFile: false,
        presets: [
          '@babel/preset-react',
          [
            '@babel/preset-env',
            {
              loose: true,
              useBuiltIns: false,
              bugfixes: true,
              modules: false,
              configPath: resolvedRoot,
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
      commonjs(),
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
  .option('--css-modules [cssmodules]', 'Use CSS Modules instead global CSS', { default: true })
  .option('--ts-config', 'Path to your tsconfig.json')
  .option('--format <format>', 'Output format (cjs | umd | es | iife), can be used multiple times', {
    default: ['es']
  })
  .option('--quiet', 'Show minimal logs', { default: false })
  .option('--replace', 'Replaces strings in files while bundling')
  .option('--banner <banner>', 'The file banner')
  .option('--footer <footer>', 'The file footer')
  .example((bin) => `  ${bin} src/index.js`)
  .example((bin) => `  ${bin} src/index.js --format cjs --format esm`)
  .example((bin) => `  ${bin} src/index.js --root-dir packages/ui-library`)
  .example((bin) => `  ${bin} src/index.js --no-css-modules`)
  .example((bin) => `  ${bin} src/index.js --css-modules=[name]__[local]___[hash:base64:5]`)
  .example((bin) => `  ${bin} src/index.js --replace.VERSION 1.0.0`)
  .example((bin) => `  ${bin} src/index.ts --ts-config tsconfig.release.json`)
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
        tsConfig: options.tsConfig,
        cssModules: options.cssModules,
        replacedStrings: options.replace,
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
