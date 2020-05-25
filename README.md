# shikaka

> Q: Do you want to bundle your UI components as easy as possible?
> A: [Shikaka!](https://www.youtube.com/watch?v=PcjFVTI4_Gw)

## Features

- 🚀 Fast, zero-config by default.
- 📦 Using Rollup under the hood.
- 🚗 Automatically transforms JS files using Babel.
- 💼 JS, CSS Minification
- 💅 Built-in support for `CSS` ,`Sass` and `CSS modules`.

This tool is not intended use as alternative to webpack or rollup. We don't bundle `node_modules` or supporting every project requirement. The output by this library is intented to use in a modern module bundler like Parcel or Webpack. This tool was created due to the frustration of bundling React components with good defaults and fist-class CSS Modules support.

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

Don't forget to point to the right entry files in your package.json

```js
{
  "name": "foo",                   // your package name
  "source": "src/index.js",       // your source code
  "module": "dist/index.js",     // where to generate the ESM bundle
  "scripts": {
    "build": "shikaka src/index.js"
  }
}
```

## Help

```
shikaka -h
```

#### Roadmap

- [ ] Typescript Support
- [ ] Tests
- [ ] Extract CSS files on component level
- [ ] Support `Pure` Scope in CSS Modules