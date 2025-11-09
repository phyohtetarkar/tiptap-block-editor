import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  TableSelectionOverlayPlugin,
  TableSelectionOverlayPluginProps,
} from "./table-selection-overlay-plugin";
import { cn } from "@/lib/utils";

export interface TableSelectionOverlayProps {
  ref?: React.ForwardedRef<HTMLDivElement>;
  pluginProps: Omit<TableSelectionOverlayPluginProps, "element">;
  children: React.ReactNode;
}

export function TableSelectionOverlay({
  ref,
  children,
  pluginProps,
}: TableSelectionOverlayProps) {
  const rootElementRef = useRef(document.createElement("div"));

  useEffect(() => {
    if (typeof ref === "function") {
      ref(rootElementRef.current);
    } else if (ref) {
      ref.current = rootElementRef.current;
    }
  }, [ref]);

  useEffect(() => {
    const editor = pluginProps.editor;
    const rootElement = rootElementRef.current;

    rootElement.style.visibility = "hidden";
    rootElement.style.position = "absolute";
    rootElement.className = cn("border-2 border-primary pointer-events-none");

    if (editor.isDestroyed) {
      return;
    }

    const plugin = TableSelectionOverlayPlugin({
      ...pluginProps,
      element: rootElement,
    });

    editor.registerPlugin(plugin);

    return () => {
      editor.unregisterPlugin(pluginProps.pluginKey);
      window.requestAnimationFrame(() => {
        if (rootElement.parentNode) {
          rootElement.parentNode.removeChild(rootElement);
        }
      });
    };
  }, [pluginProps]);

  return createPortal(<>{children}</>, rootElementRef.current);
}
