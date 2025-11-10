import {
  arrow,
  autoPlacement,
  computePosition,
  flip,
  hide,
  inline,
  Middleware,
  offset,
  shift,
  size,
} from "@floating-ui/dom";
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import {
  CellSelection,
  columnResizingPluginKey
} from "@tiptap/pm/tables";
import { EditorView } from "@tiptap/pm/view";
import { Editor } from "@tiptap/react";
import { FloatingUIOptionsProps } from "./table-menu-handle-plugin";

interface SelectionRect {
  width: number;
  height: number;
}

export interface TableSelectionOverlayPluginProps {
  pluginKey: PluginKey;
  editor: Editor;
  element: HTMLElement;
  options?: FloatingUIOptionsProps;
}

export const TableSelectionOverlayPlugin = ({
  pluginKey,
  editor,
  element,
  options,
}: TableSelectionOverlayPluginProps) => {
  const floatingUIOptions: NonNullable<FloatingUIOptionsProps> = options ?? {
    strategy: "absolute",
    placement: "bottom-start",
    offset: ({ rects }) => {
      return {
        mainAxis: -rects.reference.height,
      };
    },
    flip: false,
    shift: false,
    arrow: false,
    size: false,
    autoPlacement: false,
    hide: false,
    inline: false,
  };
  const middlewares: Middleware[] = [];

  let isVisible = false;
  let currentTablePos: number | undefined;

  const getMiddlewares = () => {
    if (middlewares.length > 0) {
      return middlewares;
    }

    if (floatingUIOptions.flip) {
      middlewares.push(
        flip(
          typeof floatingUIOptions.flip !== "boolean"
            ? floatingUIOptions.flip
            : undefined
        )
      );
    }

    if (floatingUIOptions.shift) {
      middlewares.push(
        shift(
          typeof floatingUIOptions.shift !== "boolean"
            ? floatingUIOptions.shift
            : undefined
        )
      );
    }

    if (floatingUIOptions.offset) {
      middlewares.push(
        offset(
          typeof floatingUIOptions.offset !== "boolean"
            ? floatingUIOptions.offset
            : undefined
        )
      );
    }

    if (floatingUIOptions.arrow) {
      middlewares.push(arrow(floatingUIOptions.arrow));
    }

    if (floatingUIOptions.size) {
      middlewares.push(
        size(
          typeof floatingUIOptions.size !== "boolean"
            ? floatingUIOptions.size
            : undefined
        )
      );
    }

    if (floatingUIOptions.autoPlacement) {
      middlewares.push(
        autoPlacement(
          typeof floatingUIOptions.autoPlacement !== "boolean"
            ? floatingUIOptions.autoPlacement
            : undefined
        )
      );
    }

    if (floatingUIOptions.hide) {
      middlewares.push(
        hide(
          typeof floatingUIOptions.hide !== "boolean"
            ? floatingUIOptions.hide
            : undefined
        )
      );
    }

    if (floatingUIOptions.inline) {
      middlewares.push(
        inline(
          typeof floatingUIOptions.inline !== "boolean"
            ? floatingUIOptions.inline
            : undefined
        )
      );
    }

    return middlewares;
  };

  const updatePosition = (view: EditorView) => {
    const { domRect, selectionRect } = findRects(view);

    if (!domRect || !selectionRect) {
      hideOverlay();
      return;
    }

    element.style.width = `${selectionRect.width}px`;
    element.style.height = `${selectionRect.height}px`;

    const virtualElement = {
      getBoundingClientRect: () => domRect,
      getClientRects: () => [domRect],
    };

    computePosition(virtualElement, element, {
      placement: floatingUIOptions.placement,
      strategy: floatingUIOptions.strategy,
      middleware: getMiddlewares(),
    }).then(({ x, y, strategy }) => {
      element.style.position = strategy;
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
      if (isVisible) {
        floatingUIOptions.onUpdate?.();
      }
    });

    // console.log("update position: ", selectionRect);
  };

  const showOverlay = (_view: EditorView, root: HTMLElement | null) => {
    if (isVisible) {
      return;
    }

    element.style.visibility = "visible";
    element.style.opacity = "1";
    // attach to editor's parent element
    root?.appendChild(element);
    // view.dom.parentElement?.appendChild(element);

    isVisible = true;
  };

  const hideOverlay = () => {
    if (!isVisible) {
      return;
    }

    element.style.visibility = "hidden";
    element.style.opacity = "0";
    element.remove();

    isVisible = false;
    currentTablePos = undefined;
  };

  const handleResize = () => {
    if (!editor.isActive("table")) {
      return;
    }

    updatePosition(editor.view);
  };

  const findRects = (view: EditorView) => {
    let selectionRect: SelectionRect | undefined;
    let domRect: DOMRect | undefined;

    const { selection } = view.state;
    if (selection instanceof CellSelection) {
      let top: number | undefined;
      let left: number | undefined;
      let right: number | undefined;
      let bottom: number | undefined;
      selection.forEachCell((_node, pos) => {
        const cell = view.nodeDOM(pos) as HTMLTableCellElement;
        const rect = cell.getBoundingClientRect();
        if (!domRect) {
          domRect = rect;
        }

        top = Math.min(top ?? rect.top, rect.top);
        left = Math.min(left ?? rect.left, rect.left);
        right = Math.max(right ?? rect.right, rect.right);
        bottom = Math.max(bottom ?? rect.bottom, rect.bottom);

        selectionRect = {
          width: right - left,
          height: bottom - top,
        };

        if (rect.left < domRect.left && rect.top < domRect.top) {
          domRect = rect;
        }
      });
    }

    if (selection instanceof TextSelection) {
      view.state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
        const nodeName = node.type.name;
        if (nodeName === "tableHeader" || nodeName === "tableCell") {
          const cell = view.nodeDOM(pos) as HTMLTableCellElement;
          const rect = cell.getBoundingClientRect();
          domRect = rect;
          selectionRect = {
            width: rect.width,
            height: rect.height,
          };
          return false;
        }
        return true;
      });
    }

    // const tableRect = selectedRect(view.state);

    return {
      domRect,
      selectionRect,
    };
  };

  return new Plugin({
    key: pluginKey,
    view: () => {
      window.addEventListener("resize", handleResize);
      return {
        update: (view, prevState) => {
          const selectionChanged = !prevState?.selection.eq(
            view.state.selection
          );
          const docChanged = !prevState?.doc.eq(view.state.doc);

          const { composing } = view;

          const isSame = !selectionChanged && !docChanged;

          if (composing || isSame) {
            return;
          }

          if (!editor.isActive("table")) {
            hideOverlay();
            return;
          }

          updatePosition(view);

          const { ranges } = view.state.selection;
          const from = Math.min(...ranges.map((range) => range.$from.pos));
          const to = Math.max(...ranges.map((range) => range.$to.pos));

          let tableNodePos: number | undefined = undefined;

          editor.state.doc.nodesBetween(from, to, (node, p) => {
            if (node.type.name === "table") {
              tableNodePos = p;
              return false;
            }
            return false;
          });

          if (tableNodePos === undefined) {
            hideOverlay();
            return;
          }

          if (currentTablePos !== tableNodePos) {
            hideOverlay();
          }

          currentTablePos = tableNodePos;

          if (isVisible) {
            return;
          }

          const table = view.nodeDOM(tableNodePos) as HTMLDivElement;
          if (!table) {
            hideOverlay();
            return;
          }

          showOverlay(view, table.querySelector(".table-selection-container"));
        },
        destroy: () => {
          window.removeEventListener("resize", handleResize);
          hideOverlay();
          floatingUIOptions.onDestroy?.();
        },
      };
    },
    props: {
      handleDOMEvents: {
        mousemove: (view) => {
          if (!columnResizingPluginKey.getState(view.state)?.dragging) {
            return;
          }

          updatePosition(view);
        },
      },
    },
  });
};
