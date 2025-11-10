import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AdminPanel from './AdminPanel.jsx'
import './index.css'

// Simple routing based on URL path
const AppRouter = () => {
  const path = window.location.pathname;
  
  if (path === '/admin') {
    return <AdminPanel />;
  }
  
  return <App />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
)