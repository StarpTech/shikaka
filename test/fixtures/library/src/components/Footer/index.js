// eslint-disable-next-line no-unused-vars
import React from 'react'
import styles from './index.module.less';

export default function Footer({ children, ...rest }) {
    return (
      <button className={styles.button} {...rest}>
        {children}
      </button>
    );
  }
  