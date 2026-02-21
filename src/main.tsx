import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { registerSW } from 'virtual:pwa-register';
import '@fontsource/orbitron';
import '@fontsource/press-start-2p';
import '@fontsource/rajdhani';
import './styles.css';

registerSW({
  immediate: true,
});

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found');
}

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);