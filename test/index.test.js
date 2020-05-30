const { prepareLibraryTest } = require('./utils');

describe('fixtures', () => {
  test('build "library" with shikaka', async () => {
    const {
      files: { Button, Footer, Modal, styles }
    } = await prepareLibraryTest('library', 'src/index.js');

    expect(Button).toMatch(
      `import { _objectWithoutPropertiesLoose, _extends } from './_rollupPluginBabelHelpers-`
    );
    expect(Button).toMatch(`import React from 'react';

var styles = {"button":"Button__button","unused":"Button__unused","bar-1":"Button__bar-1","bar-2":"Button__bar-2"};

function Button(_ref) {
  let {
    children
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["children"]);

  return /*#__PURE__*/React.createElement("button", _extends({
    className: styles.button
  }, rest), children);
}

export default Button;
`);
    expect(styles).toMatch(`.Button__button {
  display: grid;
  transition: all .5s;
  user-select: none;
  background: linear-gradient(to bottom, white, black);
}
.Button__unused {
  width: auto;
}
.Button__bar-1 .bar .Button__bar-2 {
  color: white;
}`);

    expect(Footer).toMatch(
      `import { _objectWithoutPropertiesLoose, _extends } from './_rollupPluginBabelHelpers-`
    );
    expect(Footer).toMatch(`import React from 'react';

var styles = {"footer":"Footer__footer"};

function Footer(_ref) {
  let {
    children
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["children"]);

  return /*#__PURE__*/React.createElement("button", _extends({
    className: styles.button
  }, rest), children);
}

export default Footer;
`);
    expect(styles).toMatch(`.Footer__footer {
  color: #fff;
  background: #428bca;
}`);

    expect(Modal).toMatch(`import React from 'react';

// eslint-disable-next-line no-unused-vars
function Modal() {
  const array = [1, 2, 3];
  const [first, second] = array;
  return /*#__PURE__*/React.createElement("div", null, first + second);
}

export default Modal;
`);
    expect(styles).toMatch(`.Modal__modal {
  width: auto;
}
.Modal__modal__foo {
  border: 1px solid;
}`);
  });

  test('build "library-ts" with shikaka', async () => {
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
