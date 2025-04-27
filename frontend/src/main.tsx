
import './styles/global.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

import './styles/App.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Failed to find the root element with id='root'. Check your index.html.");
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);