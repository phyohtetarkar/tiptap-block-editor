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
import { Plugin, PluginKey } from "@tiptap/pm/state";
import {
  CellSelection,
  columnResizingPluginKey,
  tableEditingKey
} from "@tiptap/pm/tables";
import { EditorView } from "@tiptap/pm/view";
import { Editor, findParentNodeClosestToPos } from "@tiptap/react";

interface TableMenuHandlePluginState {
  openedMenu: boolean;
}

export interface FloatingUIOptionsProps {
  strategy?: "absolute" | "fixed";
  placement?:
    | "top"
    | "right"
    | "bottom"
    | "left"
    | "top-start"
    | "top-end"
    | "right-start"
    | "right-end"
    | "bottom-start"
    | "bottom-end"
    | "left-start"
    | "left-end";
  offset?: Parameters<typeof offset>[0] | boolean;
  flip?: Parameters<typeof flip>[0] | boolean;
  shift?: Parameters<typeof shift>[0] | boolean;
  arrow?: Parameters<typeof arrow>[0] | false;
  size?: Parameters<typeof size>[0] | boolean;
  autoPlacement?: Parameters<typeof autoPlacement>[0] | boolean;
  hide?: Parameters<typeof hide>[0] | boolean;
  inline?: Parameters<typeof inline>[0] | boolean;

  onShow?: () => void;
  onHide?: () => void;
  onUpdate?: () => void;
  onDestroy?: () => void;
}

export interface TableMenuHandlePluginProps {
  pluginKey: PluginKey<TableMenuHandlePluginState>;
  editor: Editor;
  element: HTMLElement;
  menuType: "row" | "column";
  options?: FloatingUIOptionsProps;
}

export const rowMenuPluginKey = new PluginKey<TableMenuHandlePluginState>(
  "table-row-menu-handle"
);
export const columnMenuPluginKey = new PluginKey<TableMenuHandlePluginState>(
  "table-column-menu-handle"
);

export const TableMenuHandlePlugin = ({
  pluginKey,
  editor,
  element,
  menuType,
  options,
}: TableMenuHandlePluginProps) => {
  const floatingUIOptions: NonNullable<FloatingUIOptionsProps> = options ?? {
    strategy: "absolute",
    placement: "top",
    offset: 0,
    flip: {},
    shift: {},
    arrow: false,
    size: false,
    autoPlacement: false,
    hide: false,
    inline: false,
  };

  const isRow = menuType === "row";
  const middlewares: Middleware[] = [];

  let ticking = false;
  let isVisible = false;
  let currentTablePos: number | undefined;
  let currentCellPos: number | undefined;

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

  const selectCells = () => {
    if (currentCellPos === undefined) {
      return;
    }

    const cellPos = currentCellPos;
    editor
      .chain()
      .command(({ tr, state }) => {
        const resolvedPos = state.doc.resolve(cellPos);
        const selectFn = isRow
          ? CellSelection.rowSelection
          : CellSelection.colSelection;
        const selection = selectFn(resolvedPos);
        tr.setSelection(selection);
        return true;
      })
      .run();
  };

  const showMenu = (_view: EditorView, root: HTMLElement | null) => {
    if (isVisible) {
      return;
    }

    element.style.visibility = "visible";
    element.style.opacity = "1";
    // attach to editor's parent element
    root?.appendChild(element);
    // view.dom.parentElement?.appendChild(element);

    floatingUIOptions.onShow?.();

    isVisible = true;
  };

  const hideMenu = () => {
    if (!isVisible) {
      return;
    }

    const pluginState = pluginKey.getState(editor.view.state);
    if (pluginState?.openedMenu) {
      return;
    }

    element.style.visibility = "hidden";
    element.style.opacity = "0";
    element.remove();

    floatingUIOptions.onHide?.();

    isVisible = false;
    currentCellPos = undefined;
    currentTablePos = undefined;
    // console.log("hide menu: ", pluginKey);
  };

  const updatePosition = (view: EditorView, rect: DOMRect) => {
    const pluginState = pluginKey.getState(view.state);
    if (pluginState?.openedMenu) {
      return;
    }

    const virtualElement = {
      getBoundingClientRect: () => rect,
      getClientRects: () => [rect],
    };

    computePosition(virtualElement, element, {
      placement: floatingUIOptions.placement,
      strategy: floatingUIOptions.strategy,
      middleware: getMiddlewares(),
    }).then(({ x, y, strategy }) => {
      if (isRow) {
        element.style.height = `${rect.height}px`;
      } else {
        element.style.width = `${rect.width}px`;
      }
      element.style.position = strategy;
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;

      if (isVisible) {
        floatingUIOptions.onUpdate?.();
      }
    });
  };

  const handleMouseMove = (view: EditorView, evt: MouseEvent) => {
    const target = evt.target as Element;
    if (!target) {
      return;
    }

    if (columnResizingPluginKey.getState(view.state)?.dragging) {
      hideMenu();
      return;
    }

    if (tableEditingKey.getState(view.state) !== null) {
      hideMenu();
      return;
    }

    if (isRow && columnMenuPluginKey.getState(view.state)?.openedMenu) {
      hideMenu();
      return;
    } else if (rowMenuPluginKey.getState(view.state)?.openedMenu) {
      hideMenu();
      return;
    }

    const pluginState = pluginKey.getState(view.state);
    if (pluginState?.openedMenu) {
      return;
    }

    const pos = view.posAtDOM(target, 0);

    if (pos === undefined) {
      return;
    }

    let cellNodePos: number | undefined = undefined;
    let tableNodePos: number | undefined = undefined;

    view.state.doc.nodesBetween(pos, pos, (node, p) => {
      if (node.type.name === "tableHeader") {
        cellNodePos = p;
        return false;
      }
      if (node.type.name === "tableCell") {
        cellNodePos = p;
        return false;
      }
      if (node.type.name === "table") {
        tableNodePos = p;
      }
      return true;
    });

    if (tableNodePos === undefined) {
      hideMenu();
      return;
    }

    if (currentTablePos !== tableNodePos) {
      hideMenu();
    }

    currentTablePos = tableNodePos;

    const tableRoot = view.nodeDOM(tableNodePos);
    if (!tableRoot || !(tableRoot instanceof HTMLDivElement)) {
      hideMenu();
      return;
    }
    // console.log(TableMap.get(view.state.doc.nodeAt(tableNodePos)!));

    const table = tableRoot.querySelector("table");
    if (!table) {
      return;
    }

    const tableRect = table.getBoundingClientRect();
    const offset = 16;

    if (evt.x > tableRect.right + offset) {
      hideMenu();
      return;
    }
    if (evt.x < tableRect.left - offset) {
      hideMenu();
      return;
    }
    if (evt.y < tableRect.top - offset) {
      hideMenu();
      return;
    }
    if (evt.y > tableRect.bottom + offset) {
      hideMenu();
      return;
    }

    if (cellNodePos === undefined) {
      return;
    }

    if (currentCellPos === cellNodePos) {
      return;
    }

    const tableCell = view.nodeDOM(cellNodePos);
    if (!tableCell || !(tableCell instanceof HTMLTableCellElement)) {
      return;
    }

    const tableCellRect = tableCell.getBoundingClientRect();

    currentCellPos = cellNodePos;

    if (isRow) {
      tableCellRect.x = tableRect.x;
    } else {
      tableCellRect.y = tableRect.y;
    }

    updatePosition(view, tableCellRect);

    if (isVisible) {
      return;
    }

    showMenu(view, tableRoot.querySelector(".table-controls"));
  };

  return new Plugin<TableMenuHandlePluginState>({
    key: pluginKey,
    state: {
      init: () => {
        return {
          openedMenu: false,
        };
      },

      apply: (tr, value) => {
        const meta = tr.getMeta(pluginKey);
        // console.log(meta);
        if (meta) {
          return {
            openedMenu: meta.openedMenu,
          };
        }
        return value;
      },
    },
    view: () => {
      return {
        update: (view, prevState) => {
          const prevPluginState = pluginKey.getState(prevState);
          const pluginState = pluginKey.getState(view.state);

          const pluginStateChanged = prevPluginState !== pluginState;
          if (pluginStateChanged && pluginState?.openedMenu) {
            selectCells();
          }

          if (isRow && columnMenuPluginKey.getState(view.state)?.openedMenu) {
            hideMenu();
            return;
          } else if (rowMenuPluginKey.getState(view.state)?.openedMenu) {
            hideMenu();
            return;
          }

          const selectionChanged = !prevState?.selection.eq(
            view.state.selection
          );
          const docChanged = !prevState?.doc.eq(view.state.doc);

          const { composing } = view;

          const isSame =
            !selectionChanged && !docChanged && !pluginStateChanged;

          if (composing || isSame) {
            return;
          }

          if (!editor.isActive("table")) {
            return;
          }

          if (currentCellPos === undefined) {
            hideMenu();
            return;
          }

          const cellNode = view.state.doc.nodeAt(currentCellPos);
          const tableNode = findParentNodeClosestToPos(
            view.state.doc.resolve(currentCellPos),
            (n) => {
              return n.type.name === "table";
            }
          );

          if (!tableNode || !cellNode) {
            hideMenu();
            return;
          }

          const tableCell = view.nodeDOM(currentCellPos);
          const tableRoot = view.nodeDOM(tableNode.pos);

          if (!tableRoot || !(tableRoot instanceof HTMLDivElement)) {
            hideMenu();
            return;
          }

          if (!tableCell || !(tableCell instanceof HTMLTableCellElement)) {
            hideMenu();
            return;
          }

          const table = tableRoot.querySelector("table");
          if (!table) {
            return;
          }

          const tableRect = table.getBoundingClientRect();
          const tableCellRect = tableCell.getBoundingClientRect();

          if (isRow) {
            tableCellRect.x = tableRect.x;
          } else {
            tableCellRect.y = tableRect.y;
          }
          updatePosition(view, tableCellRect);
        },
        destroy: () => {
          hideMenu();

          floatingUIOptions.onDestroy?.();
        },
      };
    },
    props: {
      handleDOMEvents: {
        mousemove: (view, evt) => {
          if (!ticking) {
            window.requestAnimationFrame(() => {
              handleMouseMove(view, evt);
              ticking = false;
            });
            ticking = true;
          }
        },
        mousedown: handleMouseMove,
        mouseleave: hideMenu,
      },
    },
  });
};
