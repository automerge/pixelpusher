import React from 'react';
import ReactDOM from 'react-dom';
import {AppContainer} from 'react-hot-loader';
import {Provider} from 'react-redux';

import configureStore from './store/configureStore';
import autoSave from './store/autoSave';
import sync from './store/sync';
import cloudPeers from './store/cloudPeers';
import openUrlHandler from './store/openUrlHandler';

const devMode = true;
const store = configureStore(devMode);

autoSave(store)
sync(store)
cloudPeers(store)
openUrlHandler(store)

const render = () => {
  const App = require('./components/App').default;

  ReactDOM.render(
    <Provider store={store}>
      <AppContainer>
        <App dispatch={store.dispatch} />
      </AppContainer>
    </Provider>,
    document.getElementById('app')
  );
}

render();

if (module.hot) {
  module.hot.accept(render);
}
