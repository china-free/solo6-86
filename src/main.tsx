import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { useMealStore } from './store/useMealStore'
import { useShoppingStore } from './store/useShoppingStore'

useMealStore.getState().initSyncListeners()
useShoppingStore.getState().initSyncListeners()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
