import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "katex/dist/katex.min.css";
import "./components/editor/styles/block-editor.css";
import "./index.css";
import BlockEditorApp from './BlockEditorApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BlockEditorApp />
  </StrictMode>,
)
