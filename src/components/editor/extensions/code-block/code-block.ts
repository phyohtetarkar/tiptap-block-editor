import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { ReactNodeViewRenderer } from "@tiptap/react";
import CodeBlockView from "./code-block-view";

export const CustomCodeBlock = CodeBlockLowlight.extend({

  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),

    }
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView, {
      className: "my-6",
    });
  },
  
});
