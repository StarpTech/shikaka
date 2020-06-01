const { prepareLibraryTest } = require('./utils');

describe('library-no-css-modules fixture', () => {
  test('build with shikaka', async () => {
    const {
      files: { Button, styles }
    } = await prepareLibraryTest('library-no-css-modules', 'src/index.js', ['--no-cssmodules']);

    expect(Button).toMatch(`import React from 'react';

// eslint-disable-next-line no-unused-vars
function Button(props) {
  return /*#__PURE__*/React.createElement("button", {
    className: "button"
  }, props.children);
}

export default Button;
`);
    expect(styles).toMatch(`.button {
  display: grid;
  transition: all .5s;
  user-select: none;
  background: linear-gradient(to bottom, white, black);
}`);
  });
});
