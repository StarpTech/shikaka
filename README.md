![Node CI](https://github.com/StarpTech/shikaka/workflows/Node%20CI/badge.svg)

# shikaka

> Q: Do you want to bundle your UI components as easy as possible?
> A: [Shikaka!](https://www.youtube.com/watch?v=PcjFVTI4_Gw)

## Features

- Fast, zero-config by default.
- It cares about Tree-Shaking (Rollup), Minification (Terser), Autoprefixing (PostCSS) and Polyfilling (Babel).
- Built-in support for [`CSS Modules`](https://github.com/css-modules/css-modules) in `SASS`, `LESS` or `CSS`.
- Works with Typescript and React.
- Creates multiple optimized entry points.

This tool is not intended use as alternative to webpack or rollup. We don't bundle `node_modules` or supporting every project requirement. The output by this library is intented to use in a modern module bundler like Parcel or Webpack. This tool was created due to the frustration of bundling React components with good defaults and first-class CSS Modules support.

## Example

### Multiple entry points

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

and it produces by default this:

```
dist
├── Button.js
├── index.js
├── Modal.js
└── styles.css
```

consumable:

```js
import { Button } from 'your-module' // or
import Button from 'your-module/dist/Button'
```

### Single entry point

You can also just pass a single entry point.

```
$ shikaka src/index.js
```

and it produces this:
```
dist
└── index.js
```

consumable:
```js
import MyHook from 'your-module'
```

## Installation & Setup

1. Install by running: `npm i -D shikaka`
2. Set up your `package.json`:

```js
{
  "name": "foo",                  // your package name
  "source": "src/index.js",       // your source code
  "main": "dist/cjs/index.js",    // for CommonJS/Node bundle
  "module": "dist/es/index.js",   // for ESM bundle
  "scripts": {
    "build": "shikaka src/index.js --format cjs --format es" // by default only ESM
  },
  "browserslist": [             // your supported browsers (used to configure babel and postcss)
    "defaults",
    "not ie 11",
    "not IE_Mob 11"
  ],
}
```

## Help

```
shikaka -h
```

## Development

### Installation

```
yarn install
```

### Tests

If you change the code, update the tests and run:

```
yarn test
```

### Storybook

Test a library fixture output as it would be your real library with [Storybook](https://storybook.js.org/).

```
node cli.js src/index.js --out-dir test/fixtures/library/dist --root-dir test/fixtures/library
yarn storybook
```

### Alternatives

- [create-react-library](https://github.com/transitive-bullshit/create-react-library) As the name suggest, it's like create-react-app but for libraries. The difference between Shikaka is that it produce a complete library template and relies directly on the build tools like rollup and babel. Shikaka was only build to bundle your library with good defaults so you can publish your library without worrying about size and compatibility.