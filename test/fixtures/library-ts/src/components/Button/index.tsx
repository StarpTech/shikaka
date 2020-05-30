// eslint-disable-next-line no-unused-vars
import React from 'react';
import styles from './index.module.css';

export default function Button(props: object) {
  return (
    <button className={styles.button}>{props.children}</button>
  );
}
