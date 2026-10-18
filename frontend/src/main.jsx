import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { clearAllFirestoreData } from './lib/firebase'
import App from './App.jsx'

// Keep session persistent across page refreshes
console.info('%c[Firebase Auth]%c Persistent Cloud Session Enabled.', 'color: #027e6f; font-weight: bold;', 'color: #292827;');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
