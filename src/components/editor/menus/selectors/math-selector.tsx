import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";

export const MathSelector = ({ editor }: { editor: Editor }) => {
  const editorState = useEditorState({
    editor,
    selector: (instance) => ({
      isMath: instance.editor.isActive("math"),
    }),
  });

  return (
    <Button
      variant="ghost"
      className="rounded-none"
      onClick={() => {
        if (editorState.isMath) {
          editor.chain().focus().unsetLatex().run();
        } else {
          editor.chain().focus().setLatex().run();
        }
      }}
    >
      <span
        className={cn("font-medium", {
          "text-primary": editorState.isMath,
        })}
      >
        LaTeX
      </span>
    </Button>
  );
};
