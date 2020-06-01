// eslint-disable-next-line no-unused-vars
import React from 'react';
import './index.css';

export default function Button(props) {
  return (
    <button className="button">{props.children}</button>
  );
}
