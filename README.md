![Node CI](https://github.com/StarpTech/shikaka/workflows/Node%20CI/badge.svg)

# shikaka

> Q: Do you want to bundle your UI components as easy as possible?
> A: [Shikaka!](https://www.youtube.com/watch?v=PcjFVTI4_Gw)

## Features

- 🚀 Fast, zero-config by default.
- 📦 Using Rollup under the hood.
- 🤳 Using browserlist to produce highly compatible JS and CSS.
- 🚗 Automatically transforms JS files using Babel.
- 💼 JS, CSS Minification.
- 💅 Built-in support for `CSS modules` in `SASS`, `LESS` or `CSS`.

This tool is not intended use as alternative to webpack or rollup. We don't bundle `node_modules` or supporting every project requirement. The output by this library is intented to use in a modern module bundler like Parcel or Webpack. This tool was created due to the frustration of bundling React components with good defaults and first-class CSS Modules support.

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

and produces by default this:

```
dist
├── Button.js
├── index.js
├── Modal.js
└── styles.css
```

consumable:

```jsx
import { Button } from 'your-module' // or
import Button from 'your-module/dist/Button'
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

Test the library output as it would be your real library with [Storybook](https://storybook.js.org/).

```
node cli.js test/fixtures/library/src/index.js // example
yarn storybook
```

#### Roadmap

- [ ] Typescript Support
- [ ] Extract CSS files on component level
- [ ] Support `Pure` Scope in CSS Modules