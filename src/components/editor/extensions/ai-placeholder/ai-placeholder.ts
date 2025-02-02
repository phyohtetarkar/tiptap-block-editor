import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import AiCompletionView from "./ai-placeholder-view";

export interface AiPlaceholderOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    aiPlaceholderCommands: {
      setAiPlaceholder: (props: { from: number; to: number }) => ReturnType;
    };
  }
}

export const AiPlaceholder = Node.create<AiPlaceholderOptions>({
  name: "aiPlaceholder",
  inline: true,
  group: "inline",
  atom: true,
  selectable: false,
  marks: "_",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addCommands() {
    return {
      setAiPlaceholder:
        ({ from, to }) =>
        ({ chain }) => {
          return chain()
            .focus()
            .command(({ commands }) => {
              commands.toggleNode("paragraph", "paragraph");
              return true;
            })
            .scrollIntoView()
            .insertContentAt(
              { from, to },
              {
                type: this.name,
              }
            )
            .setMeta("preventUpdate", true)
            .run();
        },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AiCompletionView, {
      className: this.options.HTMLAttributes.class,
    });
  },
});
