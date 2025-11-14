import { mergeAttributes, Node } from "@tiptap/core";
import { EditorState } from "@tiptap/pm/state";
import katex, { KatexOptions } from "katex";

export interface MathematicsOptions {
  shouldRender: (state: EditorState, pos: number) => boolean;
  katexOptions?: KatexOptions;
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mathematicsCommands: {
      setLatex: () => ReturnType;
      unsetLatex: () => ReturnType;
    };
  }
}

export const Mathematics = Node.create<MathematicsOptions>({
  name: "math",
  inline: true,
  group: "inline",
  atom: true,
  content: "text*",
  marks: "",

  addAttributes() {
    return {
      "data-content-type": {
        default: this.name,
      },
    };
  },

  addOptions() {
    return {
      shouldRender: (state, pos) => {
        const $pos = state.doc.resolve(pos);

        if (!$pos.parent.isTextblock) {
          return false;
        }

        return $pos.parent.type.name !== "codeBlock";
      },
      katexOptions: {
        throwOnError: false,
      },
      HTMLAttributes: {},
    };
  },

  addCommands() {
    return {
      setLatex:
        () =>
        ({ chain, state }) => {
          const { from, to, $anchor } = state.selection;

          const latex = state.doc.textBetween(from, to);

          if (!latex) {
            return false;
          }

          if (!this.options.shouldRender(state, $anchor.pos)) {
            return false;
          }

          // const content = `<span data-content-type="${this.name}">${latex}</span>`;

          return chain()
            .insertContentAt(
              { from: from, to: to },
              {
                type: this.name,
                content: [
                  {
                    type: "text",
                    text: latex,
                  },
                ],
              }
            )
            .setTextSelection({ from: from, to: to + 2 })
            .run();
        },
      unsetLatex:
        () =>
        ({ state, chain }) => {
          const { from, to } = state.selection;

          const node = state.doc.nodeAt(from);
          if (!node || node.type.name !== this.name) {
            return false;
          }

          const latex = node.textContent;

          return chain()
            .command(({ tr }) => {
              tr.insertText(latex, from, to);
              return true;
            })
            .setTextSelection({
              from: from,
              to: from + latex.length,
            })
            .run();
        },
    };
  },

  parseHTML() {
    return [{ tag: `span[data-content-type="${this.name}"]` }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-content-type": this.name,
      }),
      0,
    ];
  },

  renderText({ node }) {
    return node.textContent ?? "";
  },

  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const dom = document.createElement("span");
      const latex = node.textContent ?? "";

      Object.entries(this.options.HTMLAttributes).forEach(([key, value]) => {
        dom.setAttribute(key, value);
      });

      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        dom.setAttribute(key, value);
      });

      const handleClick = () => {
        if (editor.isEditable && typeof getPos === "function") {
          const pos = getPos();
          if (pos === undefined) {
            return;
          }
          const nodeSize = node.nodeSize;
          editor.commands.setTextSelection({ from: pos, to: pos + nodeSize });
        }
      };

      dom.addEventListener("click", handleClick);

      //dom.contentEditable = "false";

      katex.render(latex, dom, this.options.katexOptions);

      return {
        dom: dom,
        destroy: () => {
          dom.removeEventListener("click", handleClick);
        },
      };
    };
  },
});
