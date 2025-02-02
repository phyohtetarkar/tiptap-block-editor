import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./index.css";
import BlockEditorApp from './BlockEditorApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BlockEditorApp />
  </StrictMode>,
)
