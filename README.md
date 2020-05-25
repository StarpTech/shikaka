# shikaka

> Q: Do you want to bundle your UI components as easy as possible?
> A: [Shikaka!](https://www.youtube.com/watch?v=PcjFVTI4_Gw)

## Features

- 🚀 Fast, zero-config by default.
- 📦 Using Rollup under the hood.
- ✔️ Builds for ES and CJS by default.
- 🚗 Automatically transforms JS files using Babel/TypeScript.
- 💼 JS, CSS Minification
- 💅 Built-in support for `CSS` ,`Sass` and `CSS modules`.

This tool is not intended use as alternative to webpack or rollup. We don't bundle `node_modules` or supporting any project requirement. The output by this library is intented to use in a modern module bundler like Parcel, Webpack. This tool was created due to the frustration of bundling React components for Next.js + CSS Modules.

## Example

Operates on a fixed directory structure like:

```
$ shikaka src/index.js

your-library
└── src
    ├── components
    │   └── Button
    │       ├── index.js
    │       └── index.module.css
    └── index.js
```

and produces this:

```
dist
├── cjs
│   ├── Button.js
│   ├── index.js
├── css
│   ├── styles.css
│   └── styles.es.css
└── es
    ├── Button.js
    └── index.js
```

## Help

```
shikaka v0.0.1

Usage:
  $ shikaka <input>

Commands:
  <input>  Library entry file

For more info, run any command with the `--help` flag:
  $ shikaka --help

Options:
  --root-dir <rootDir>           The root directory to resolve files from (default: .)
  --out-dir <outDir>             Output directory (default: dist)
  --minify                       Minify CSS and JS output files (default: false)
  --report                       Generates a report about your bundle size (default: false)
  --css-file-name <cssFileName>  Output directory of the extracted CSS (default: styles.css)
  --format <format>              Output format (cjs | umd | es | iife), can be used multiple times (default: es,cjs)
  --quiet                        Show minimal logs (default: false)
  --banner <banner>              The file banner 
  --footer <footer>              The file footer 
  -v, --version                  Display version number 
  -h, --help                     Display this message 

Examples:
  shikaka src/index.js
  shikaka src/index.js --format cjs --format esm
  shikaka src/index.js --root-dir packages/ui-library
  shikaka src/index.js --css-file-name theme.css
```

#### Roadmap

- [ ] Typescript Support
- [ ] Tests
- [ ] Extract CSS files on component level
