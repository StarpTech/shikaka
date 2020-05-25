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
shikaka --help
```

#### Roadmap

- [ ] Typescript Support
- [ ] Tests
- [ ] Extract CSS files on component level
