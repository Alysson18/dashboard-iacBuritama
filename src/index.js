import React from 'react';
import ReactDOM from 'react-dom';
import App from './app.jsx';
import { AuthProvider } from './app/Context/auth.jsx';
import { Buffer } from 'buffer';
import 'buffer';
import 'timers-browserify';
import 'stream-browserify';

window.Buffer = Buffer;


ReactDOM.render(<AuthProvider> <App /> </AuthProvider>,
  document.getElementById('root')
);
