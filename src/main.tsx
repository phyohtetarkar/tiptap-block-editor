import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Colors,
  DoughnutController,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PieController,
  PointElement,
  PolarAreaController,
  RadarController,
  RadialLinearScale,
  Title,
  Tooltip,
} from "chart.js";
import "katex/dist/katex.min.css";
import mermaid from "mermaid";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import BlockEditorApp from "./BlockEditorApp.tsx";
import "./components/editor/styles/block-editor.css";
import "./index.css";

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

Chart.register(
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  PieController,
  DoughnutController,
  ArcElement,
  BarController,
  BarElement,
  RadarController,
  RadialLinearScale,
  PolarAreaController,
  Filler,
  Tooltip,
  Legend,
  Colors,
  Title
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BlockEditorApp />
  </StrictMode>
);
