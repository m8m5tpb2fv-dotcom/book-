import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'

declare global {
  interface Window {
    __waveBootTimer?: ReturnType<typeof setTimeout>
  }
}

// The bundle executed successfully — cancel the stale-cache recovery reload
// (see index.html) and clear the retry counter so it starts fresh next time.
window.clearTimeout(window.__waveBootTimer)
sessionStorage.removeItem('wave_boot_retries')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
