import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import './style/global.css'
import Routes from './router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
  </StrictMode>,
)
