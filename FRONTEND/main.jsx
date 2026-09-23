<script type="module" src="/src/main.jsx"></script>
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast';

// Place <Toaster position="top-right" /> inside your root return component


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
    <Toaster position="top-right" />
  </React.StrictMode>,
)
