import { Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import AiWriterView from "./ai-writer-view";

export interface AiWriterOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    aiWriterCommands: {
      setAiWriter: () => ReturnType;
    };
  }
}

export const AiWriter = Node.create<AiWriterOptions>({
  name: "aiWriter",
  group: "block",
  marks: "",
  atom: true,

  addOptions() {
    return {
      apiUrl: "/api/completion",
      HTMLAttributes: {},
    };
  },

  addCommands() {
    return {
      setAiWriter:
        () =>
        ({ editor, chain }) => {
          const $aiWriter = editor.$node(this.name);
          if ($aiWriter) {
            return false;
          }

          return chain()
            .aiReset()
            .insertContent({
              type: this.name,
            })
            .setMeta("preventUpdate", true)
            .run();
        },
    };
  },

  renderHTML() {
    return ["div"];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AiWriterView, {
      className: this.options.HTMLAttributes.class,
    });
  },
});
