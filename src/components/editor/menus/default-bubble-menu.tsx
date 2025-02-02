import { Editor, isTextSelection } from "@tiptap/core";
import { BubbleMenu } from "@tiptap/react";
import {
  AiSelector,
  MathSelector,
  NodeSelector,
  TextAlignSelector,
  TextButtons,
} from "./selectors";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export const DefaultBubbleMenu = ({
  editor,
  showAiTools,
}: {
  editor: Editor | null;
  showAiTools?: boolean;
}) => {
  if (!editor) {
    return null;
  }

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        placement: "top",
        hideOnClick: false,
        moveTransition: "transform 0.15s ease-out",
      }}
      shouldShow={({ editor, state }) => {
        const { selection } = state;
        const { empty } = selection;

        if (!editor.isEditable) {
          return false;
        }

        if (empty) {
          return false;
        }

        if (!isTextSelection(selection)) {
          return false;
        }

        if (editor.isActive("codeBlock")) {
          return false;
        }

        return true;
      }}
    >
      <ScrollArea className="max-w-[90vw] rounded-md border bg-popover shadow-xl">
        <div className="flex">
          {showAiTools && (
            <>
              <AiSelector editor={editor} />
              <Separator orientation="vertical" className="h-10" />
            </>
          )}
          <NodeSelector editor={editor} />
          <Separator orientation="vertical" className="h-10" />
          <MathSelector editor={editor} />
          <Separator orientation="vertical" className="h-10" />
          <TextButtons editor={editor} />
          <Separator orientation="vertical" className="h-10" />
          <TextAlignSelector editor={editor} />
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </BubbleMenu>
  );
};
