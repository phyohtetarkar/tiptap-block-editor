import { cn } from "@/lib/utils";
import { offset } from "@floating-ui/dom";
import DragHandle from "@tiptap/extension-drag-handle-react";
import { Placeholder } from "@tiptap/extensions";
import { Content, Editor, EditorContent, useEditor } from "@tiptap/react";
import { GripVerticalIcon } from "lucide-react";
import { toast } from "sonner";
import { defaultExtensions } from "./default-extensions";
import { Ai } from "./extensions/ai";
import { getSuggestion, SlashCommand } from "./extensions/slash-command";
import { DefaultBubbleMenu } from "./menus/default-bubble-menu";
import { TableHandle } from "./menus/table-options-menu";

interface BlockEditorProps {
  content?: Content;
  placeholder?: string;
  onCreate?: (editor: Editor) => void;
  onUpdate?: (editor: Editor) => void;
}

const BlockEditor = ({
  content,
  placeholder,
  onCreate,
  onUpdate,
}: BlockEditorProps) => {
  const editor = useEditor({
    extensions: [
      ...defaultExtensions,
      Placeholder.configure({
        placeholder: placeholder ?? "Type  /  for commands...",
        emptyEditorClass: cn("is-editor-empty text-gray-400"),
        emptyNodeClass: cn("is-empty text-gray-400"),
      }),
      Ai.configure({
        onError: (error) => {
          console.error(error);
          toast.error("Error", {
            description: error.message,
          });
        },
      }),
      SlashCommand.configure({
        suggestion: getSuggestion({ ai: true }),
      }),
    ],
    content: content,
    immediatelyRender: true,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        spellcheck: "false",
        class: cn("!pl-10"),
      },
    },
    onCreate: ({ editor }) => {
      onCreate?.(editor);
    },
    onUpdate: ({ editor }) => {
      onUpdate?.(editor);
      // console.log(editor.getHTML());
    },
    onContentError: ({ error }) => {
      console.error(error);
    },
  });

  return (
    <>
      <DragHandle
        editor={editor}
        computePositionConfig={{
          middleware: [offset(20)],
        }}
      >
        <GripVerticalIcon className="text-muted-foreground" />
      </DragHandle>
      <EditorContent
        editor={editor}
        className="prose dark:prose-invert focus:outline-none max-w-full z-0"
      />
      <TableHandle editor={editor} />
      <DefaultBubbleMenu editor={editor} showAiTools={true} />
    </>
  );
};

export { BlockEditor, type BlockEditorProps };
