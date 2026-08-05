import { cn } from "@/lib/utils";
import { mergeAttributes, Node } from "@tiptap/core";
import { NodeSelection } from "@tiptap/pm/state";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { TreeDiagramView } from "./tree-diagram-view";

export interface TreeDiagramOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    treeDiagramCommands: {
      setTreeDiagram: (props: { data: string }) => ReturnType;
      updateTreeDiagram: (props: { data: string }) => ReturnType;
    };
  }
}

export const TreeDiagram = Node.create<TreeDiagramOptions>({
  name: "treeDiagram",
  group: "block",
  content: "text*",
  marks: "",
  atom: true,
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
      setTreeDiagram: ({ data }) => {
        return ({ commands }) => {
          if (!data) {
            return false;
          }

          return commands.insertContent({
            type: this.name,
            content: [
              {
                type: "text",
                text: data,
              },
            ],
          });
        };
      },
      updateTreeDiagram: ({ data }) => {
        return ({ state, commands }) => {
          if (!data) {
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
                  text: data,
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
        class: cn("tree hidden data-[processed=true]:block"),
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TreeDiagramView, {
      className: cn("relative border my-4"),
      attrs: () => {
        return {
          contentEditable: "false",
        };
      },
    });
  },
  
});