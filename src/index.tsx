import { ConnectedRouter } from 'connected-react-router';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import 'src/registerServiceWorker';
import { history, store } from 'src/store';
import Home from 'src/components/home/home';
import './style.css';

const App = () => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Home />
    </ConnectedRouter>
  </Provider>
);

ReactDOM.render(<App />, document.querySelector('#app'));
