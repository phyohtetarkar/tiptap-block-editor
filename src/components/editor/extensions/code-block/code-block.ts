import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { ReactNodeViewRenderer } from "@tiptap/react";
import CodeBlockView from "./code-block-view";

export const CustomCodeBlock = CodeBlockLowlight.extend({

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView, {
      className: "my-6",
    });
  },
  
});
