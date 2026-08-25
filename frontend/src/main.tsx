import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import './App.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element #root not found')
}

document.addEventListener(
  'invalid',
  (event) => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return
    const form = target.closest('form')
    form?.classList.add('form--attempted')
  },
  true,
)

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
