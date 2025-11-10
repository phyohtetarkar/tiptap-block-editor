import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "katex/dist/katex.min.css";
import "./components/editor/styles/block-editor.css";
import "./index.css";
import BlockEditorApp from "./BlockEditorApp.tsx";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
});

mermaid.registerIconPacks([
  {
    name: "logos",
    loader: () => import("@iconify-json/logos").then((module) => module.icons),
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BlockEditorApp />
  </StrictMode>
);
