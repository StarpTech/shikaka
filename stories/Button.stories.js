import React from 'react';
import { action } from '@storybook/addon-actions';
import { Button } from '@test/components';
import Button2 from '@test/components/Button';

export default {
  title: 'Button',
  component: Button,
};

export const MyButton = () => <Button onClick={action('clicked')}>Hello Button</Button>;
export const MyButton2 = () => <Button2 onClick={action('clicked')}>Hello Button2</Button2>;