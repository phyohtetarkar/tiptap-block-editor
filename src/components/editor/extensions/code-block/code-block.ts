import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { mergeAttributes, ReactNodeViewRenderer } from "@tiptap/react";
import CodeBlockView from "./code-block-view";

export const CustomCodeBlock = CodeBlockLowlight.extend({
  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      Tab: ({ editor }) => {
        if (editor.isActive(this.type.name)) {
          editor
            .chain()
            .command(({ tr }) => {
              tr.insertText("  ");
              return true;
            })
            .run();
        }
        return true;
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView, {
      as: "pre",
      attrs: mergeAttributes(this.options.HTMLAttributes),
    });
  },
});
