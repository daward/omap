import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from "react-redux";
import thunkMiddleware from "redux-thunk";
import { createStore, applyMiddleware } from "redux";

import './index.css';
import App from "./components/app";
import * as serviceWorker from './serviceWorker';
import reducers from "./reducers";
import terraingen from './terraingen';

const store = createStore(
  reducers,
  applyMiddleware(
    thunkMiddleware, // lets us dispatch() functions
  )
);

ReactDOM.render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById("root")
);

const run = () => {
  store.dispatch({ type: "ELEVATION_CHANGE", terrain: terraingen()})
  // setTimeout(run, 30000);
}
run();



// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
