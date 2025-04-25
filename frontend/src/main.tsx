// src/main.tsx (or index.tsx, or rename name.tsx to this)

import './styles/global.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // Import your main App component

// Import global styles if you have them
import './styles/App.css'; // Or your main CSS entry point

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Failed to find the root element with id='root'. Check your index.html.");
}

// Create the React root
const root = createRoot(rootElement);

// Render the main App component directly.
// App itself now includes WagmiProvider, QueryClientProvider, Router, etc.
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);