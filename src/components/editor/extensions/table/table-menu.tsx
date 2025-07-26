import { useCurrentEditor } from "@tiptap/react";
import { forwardRef, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { TableMenuPlugin, TableMenuPluginProps } from "./table-menu-plugin";

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type TableMenuProps = Omit<Optional<TableMenuPluginProps, 'pluginKey'>, "element"> &
  React.HTMLAttributes<HTMLDivElement>;

export const TableMenu = forwardRef<HTMLDivElement, TableMenuProps>(
  ({ pluginKey = "tableMenu", editor, options, children, ...restProps }, ref) => {
    const menuEl = useRef(document.createElement("div"));

    if (typeof ref === "function") {
      ref(menuEl.current);
    } else if (ref) {
      ref.current = menuEl.current;
    }

    const { editor: currentEditor } = useCurrentEditor();

    useEffect(() => {
      const tableMenuElement = menuEl.current;

      tableMenuElement.style.visibility = "hidden";
      tableMenuElement.style.position = "absolute";

      if (editor?.isDestroyed || (currentEditor as any)?.isDestroyed) {
        return;
      }

      const attachToEditor = editor || currentEditor;

      if (!attachToEditor) {
        console.warn(
          "TableMenu component is not rendered inside of an editor component or does not have editor prop."
        );
        return;
      }

      const plugin = TableMenuPlugin({
        editor: attachToEditor,
        element: tableMenuElement,
        pluginKey,
        options,
      });

      attachToEditor.registerPlugin(plugin);

      return () => {
        attachToEditor.unregisterPlugin(pluginKey);
        window.requestAnimationFrame(() => {
          if (tableMenuElement.parentNode) {
            tableMenuElement.parentNode.removeChild(tableMenuElement);
          }
        });
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor, currentEditor]);

    return createPortal(<div {...restProps}>{children}</div>, menuEl.current);
  }
);
