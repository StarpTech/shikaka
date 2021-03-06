// eslint-disable-next-line no-unused-vars
import React from 'react';
import styles from './index.module.css';

export default function Button({ children, ...rest }) {
  return (
    <button className={styles.button} {...rest}>
      {children}
    </button>
  );
}
