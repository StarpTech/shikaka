const { prepareLibraryTest } = require('./utils');

describe('library-ts fixture', () => {
  test('build with shikaka', async () => {
    const {
      files: { Button, styles }
    } = await prepareLibraryTest('library-ts', 'src/index.ts');

    expect(Button).toMatch(`import React from 'react';

var styles = {"button":"Button__button"};

// eslint-disable-next-line no-unused-vars
function Button(props) {
  return /*#__PURE__*/React.createElement("button", {
    className: styles.button
  }, props.children);
}

export default Button;
`);
    expect(styles).toMatch(`.Button__button {
  display: grid;
  transition: all .5s;
  user-select: none;
  background: linear-gradient(to bottom, white, black);
}`);
  });
});
