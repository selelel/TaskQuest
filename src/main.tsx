import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import POCpage from './page/poc'
import './style/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <POCpage />
  </StrictMode>,
)
