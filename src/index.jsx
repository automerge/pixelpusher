import React from 'react';
import ReactDOM from 'react-dom';
import {AppContainer} from 'react-hot-loader';
import {Provider} from 'react-redux';

import configureStore from './store/configureStore';

const devMode = true;
const store = configureStore(devMode);

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
