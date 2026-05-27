import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '@/store';
import App from '@/App';
import '@/index.css';
import { Toaster } from 'react-hot-toast';
import { MuiProvider } from '@/components/MuiProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <MuiProvider>
        <BrowserRouter>
          <App />
          <Toaster position="top-right" />
        </BrowserRouter>
      </MuiProvider>
    </Provider>
  </React.StrictMode>
);
