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
import { EditorState, Plugin, PluginKey, PluginView } from "@tiptap/pm/state";
import { EditorView } from "@tiptap/pm/view";
import { Editor } from "@tiptap/react";

export interface TableMenuPluginProps {
  pluginKey: PluginKey | string;
  editor: Editor;
  element: HTMLElement;
  options?: TableMenuViewProps["options"];
}

interface TableMenuViewProps {
  editor: Editor;
  view: EditorView;
  element: HTMLElement;
  options?: {
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
  };
}

export class TableMenuView implements PluginView {
  editor: Editor;

  view: EditorView;

  element: HTMLElement;

  preventHide = false;

  private isVisible = false;

  private floatingUIOptions: NonNullable<TableMenuViewProps["options"]> = {
    strategy: "absolute",
    placement: "top",
    offset: 8,
    flip: {},
    shift: {},
    arrow: false,
    size: false,
    autoPlacement: false,
    hide: false,
    inline: false,
  };

  constructor({ editor, view, element, options }: TableMenuViewProps) {
    this.editor = editor;
    this.view = view;
    this.element = element;

    this.floatingUIOptions = {
      ...this.floatingUIOptions,
      ...options,
    };

    this.element.addEventListener("mousedown", this.mousedownHandler, {
      capture: true,
    });
    this.editor.on("focus", this.focusHandler);
    this.editor.on("blur", this.blurHandler);

    this.update(view, view.state);

    if (this.shouldShow(editor)) {
      this.show();
    }
  }

  update(view: EditorView, prevState?: EditorState) {
    const selectionChanged = !prevState?.selection.eq(view.state.selection);
    const docChanged = !prevState?.doc.eq(view.state.doc);

    this.updateHandler(view, selectionChanged, docChanged);
  }

  shouldShow(editor: Editor) {
    return editor.isActive("table");
  }

  updateHandler(
    view: EditorView,
    selectionChanged: boolean,
    docChanged: boolean
  ) {
    const { composing } = view;

    const isSame = !selectionChanged && !docChanged;

    if (composing || isSame) {
      return;
    }

    if (!this.shouldShow(this.editor)) {
      this.hide();

      return;
    }

    this.updatePosition();
    this.show();
  }

  mousedownHandler = () => {
    this.preventHide = true;
  };

  focusHandler = () => {
    setTimeout(() => this.update(this.editor.view));
  };

  blurHandler = ({ event }: { event: FocusEvent }) => {
    if (this.preventHide) {
      this.preventHide = false;

      return;
    }

    if (
      event?.relatedTarget &&
      this.element.parentNode?.contains(event.relatedTarget as Node)
    ) {
      return;
    }

    if (event?.relatedTarget === this.editor.view.dom) {
      return;
    }

    this.hide();
  };

  updatePosition() {
    const { selection } = this.editor.state;
    const { ranges } = selection;
    const from = Math.min(...ranges.map((range) => range.$from.pos));
    const to = Math.max(...ranges.map((range) => range.$to.pos));

    let nodePos: number | undefined = undefined;

    this.editor.state.doc.nodesBetween(from, to, (_node, p) => {
      nodePos = p;
      return false;
    });

    if (nodePos !== undefined) {
      const node = this.editor.view.nodeDOM(nodePos) as HTMLElement;

      if (node) {
        const rect = node.getBoundingClientRect();
        const virtualElement = {
          getBoundingClientRect: () => rect,
          getClientRects: () => [rect],
        };

        computePosition(virtualElement, this.element, {
          placement: this.floatingUIOptions.placement,
          strategy: this.floatingUIOptions.strategy,
          middleware: this.middlewares,
        }).then(({ x, y, strategy }) => {
          this.element.style.width = "max-content";
          this.element.style.position = strategy;
          this.element.style.left = `${x}px`;
          this.element.style.top = `${y}px`;

          if (this.isVisible && this.floatingUIOptions.onUpdate) {
            this.floatingUIOptions.onUpdate();
          }
        });
      }
    } else {
      this.hide();
    }
  }

  show() {
    if (this.isVisible) {
      return;
    }

    this.element.style.visibility = "visible";
    this.element.style.opacity = "1";
    // attach to editor's parent element
    this.view.dom.parentElement?.appendChild(this.element);

    if (this.floatingUIOptions.onShow) {
      this.floatingUIOptions.onShow();
    }

    this.isVisible = true;
  }

  hide() {
    if (!this.isVisible) {
      return;
    }

    this.element.style.visibility = "hidden";
    this.element.style.opacity = "0";
    // remove from the parent element
    this.element.remove();

    if (this.floatingUIOptions.onHide) {
      this.floatingUIOptions.onHide();
    }

    this.isVisible = false;
  }

  destroy() {
    this.hide();
    this.element.removeEventListener("mousedown", this.mousedownHandler, {
      capture: true,
    });
    this.editor.off("focus", this.focusHandler);
    this.editor.off("blur", this.blurHandler);

    if (this.floatingUIOptions.onDestroy) {
      this.floatingUIOptions.onDestroy();
    }
  }

  get middlewares() {
    const middlewares: Middleware[] = [];

    if (this.floatingUIOptions.flip) {
      middlewares.push(
        flip(
          typeof this.floatingUIOptions.flip !== "boolean"
            ? this.floatingUIOptions.flip
            : undefined
        )
      );
    }

    if (this.floatingUIOptions.shift) {
      middlewares.push(
        shift(
          typeof this.floatingUIOptions.shift !== "boolean"
            ? this.floatingUIOptions.shift
            : undefined
        )
      );
    }

    if (this.floatingUIOptions.offset) {
      middlewares.push(
        offset(
          typeof this.floatingUIOptions.offset !== "boolean"
            ? this.floatingUIOptions.offset
            : undefined
        )
      );
    }

    if (this.floatingUIOptions.arrow) {
      middlewares.push(arrow(this.floatingUIOptions.arrow));
    }

    if (this.floatingUIOptions.size) {
      middlewares.push(
        size(
          typeof this.floatingUIOptions.size !== "boolean"
            ? this.floatingUIOptions.size
            : undefined
        )
      );
    }

    if (this.floatingUIOptions.autoPlacement) {
      middlewares.push(
        autoPlacement(
          typeof this.floatingUIOptions.autoPlacement !== "boolean"
            ? this.floatingUIOptions.autoPlacement
            : undefined
        )
      );
    }

    if (this.floatingUIOptions.hide) {
      middlewares.push(
        hide(
          typeof this.floatingUIOptions.hide !== "boolean"
            ? this.floatingUIOptions.hide
            : undefined
        )
      );
    }

    if (this.floatingUIOptions.inline) {
      middlewares.push(
        inline(
          typeof this.floatingUIOptions.inline !== "boolean"
            ? this.floatingUIOptions.inline
            : undefined
        )
      );
    }

    return middlewares;
  }
}

export const TableMenuPlugin = (props: TableMenuPluginProps) => {
  return new Plugin({
    key:
      typeof props.pluginKey === "string"
        ? new PluginKey(props.pluginKey)
        : props.pluginKey,
    view: (view) => new TableMenuView({ view, ...props }),
  });
};
