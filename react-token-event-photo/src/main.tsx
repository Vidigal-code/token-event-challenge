import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from "./App.tsx";
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from './app/store/store';
import { queryClient } from './app/providers/query-client';
import { AuthBootstrap } from './app/providers/auth-bootstrap';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <AuthBootstrap>
                    <App />
                </AuthBootstrap>
            </QueryClientProvider>
        </Provider>
    </React.StrictMode>
);