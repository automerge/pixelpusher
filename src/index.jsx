import React from 'react';
import ReactDOM from 'react-dom';
import configureStore from './store/configureStore';
import Root from './components/Root';

const devMode = true;
const store = configureStore(devMode);

export default () =>
  <Root store={store} />
