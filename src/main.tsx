import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { setupIOSCompat } from './ios'
import './styles.css'

setupIOSCompat()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
