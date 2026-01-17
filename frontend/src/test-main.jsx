import React from 'react';
import ReactDOM from 'react-dom/client';
import TestApp from './TestApp';

// Create root and render app
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);