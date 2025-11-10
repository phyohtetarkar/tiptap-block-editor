import { cn } from "@/lib/utils";
import { mergeAttributes, Node } from "@tiptap/core";
import { NodeSelection } from "@tiptap/pm/state";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { MermaidView } from "./mermaid-view";

export interface MermaidOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mermaidCommands: {
      setMermaid: (props: { code: string }) => ReturnType;
      updateMermaid: (props: { code: string }) => ReturnType;
    };
  }
}

export const Mermaid = Node.create<MermaidOptions>({
  name: "mermaid",
  group: "block",
  content: "text*",
  marks: "",
  atom: false,
  draggable: true,
  allowGapCursor: true,

  addAttributes() {
    return {
      "data-content-type": {
        default: this.name,
      },
    };
  },

  addCommands() {
    return {
      setMermaid: ({ code }) => {
        return ({ commands }) => {
          if (!code) {
            return false;
          }

          return commands.insertContent({
            type: this.name,
            content: [
              {
                type: "text",
                text: code,
              },
            ],
          });
        };
      },
      updateMermaid: ({ code }) => {
        return ({ state, commands }) => {
          if (!code) {
            return false;
          }

          const { selection } = state;

          if (!(selection instanceof NodeSelection)) {
            return false;
          }

          if (selection.node.type.name !== this.name) {
            return false;
          }

          const { from, to } = selection;

          return commands.insertContentAt(
            { from, to },
            {
              type: this.name,
              content: [
                {
                  type: "text",
                  text: code,
                },
              ],
            }
          );
        };
      },
    };
  },

  parseHTML() {
    return [{ tag: `div[data-content-type="${this.name}"]` }];
  },

  renderText({ node }) {
    return node.textContent ?? "";
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: cn("border my-4"),
      }),
      [
        "div",
        {
          class: cn("mermaid w-full"),
        },
        0,
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidView, {
      className: cn("relative border my-4"),
      attrs: () => {
        return {
          contentEditable: "false",
        };
      },
    });
  },

  //   addNodeView() {
  //     return ({ node, HTMLAttributes, getPos, editor }) => {
  //       const dom = document.createElement("div");
  //       const code = node.textContent ?? "";

  //       Object.entries(this.options.HTMLAttributes).forEach(([key, value]) => {
  //         dom.setAttribute(key, value);
  //       });

  //       Object.entries(HTMLAttributes).forEach(([key, value]) => {
  //         dom.setAttribute(key, value);
  //       });

  //       dom.textContent = "Rendering mermaid...";

  //       const uuid = crypto.randomUUID();

  //       const container = document.createElement("div");
  //       container.id = uuid;

  //       dom.appendChild(container);
  //       mermaid
  //         .render(uuid, code)
  //         .then((result) => {
  //           dom.textContent = "";
  //           container.innerHTML = result.svg;
  //           console.log(result);
  //         })
  //         .catch((e) => {
  //           console.error(e);
  //           const pos = getPos();
  //           if (pos !== undefined) {
  //             editor
  //               .chain()
  //               .focus()
  //               .command(({ tr }) => {
  //                 tr.delete(pos, node.nodeSize);
  //                 return true;
  //               })
  //               .run();
  //           }

  //           alert("Invalid mermaid code!");
  //         });

  //       return {
  //         dom: dom,
  //         ignoreMutation: () => true,
  //       };
  //     };
  //   },
});
