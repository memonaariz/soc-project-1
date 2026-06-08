import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#141c2e',
            color: '#c8d6e5',
            border: '1px solid #1e2d4a',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#00ff9d', secondary: '#0a0e1a' } },
          error: { iconTheme: { primary: '#ff3b5c', secondary: '#0a0e1a' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
