# shikaka

> Q: Do you want to bundle your UI components as easy as possible?
> A: [Shikaka!](https://www.youtube.com/watch?v=PcjFVTI4_Gw)

## Features

- 🚀 Fast, zero-config by default.
- 📦 Using Rollup under the hood.
- ✔️ Builds for ES and CJS by default.
- 🚗 Automatically transforms JS files using Babel/TypeScript.
- 💼 Minification with ES6+ support
- 💅 Built-in support for `Sass` and `CSS modules`.

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
│   └── index.js
├── css
│   └── styles.css
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
- [ ] SASS Support
- [ ] Tests
- [ ] CSS files on component level
