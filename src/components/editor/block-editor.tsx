import { cn } from "@/lib/utils";
import Placeholder from "@tiptap/extension-placeholder";
import { Content, Editor, EditorContent, useEditor } from "@tiptap/react";
import { toast } from "sonner";
import { defaultExtensions } from "./default-extensions";
import { Ai } from "./extensions/ai";
import { getSuggestion, SlashCommand } from "./extensions/slash-command";
import { CodeBlockLanguageMenu } from "./menus/codeblock-language-menu";
import { DefaultBubbleMenu } from "./menus/default-bubble-menu";
import { TableOptionsMenu } from "./menus/table-options-menu";

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
            description: error.message
          })
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
      },
    },
    onCreate: ({ editor }) => {
      onCreate?.(editor);
    },
    onUpdate: ({ editor }) => {
      onUpdate?.(editor);
    },
    onContentError: ({ error }) => {
      console.error(error);
    },
  });

  return (
    <>
      <EditorContent
        editor={editor}
        className="prose dark:prose-invert focus:outline-none max-w-full z-0"
      />
      <TableOptionsMenu editor={editor} />
      <CodeBlockLanguageMenu editor={editor} />
      <DefaultBubbleMenu editor={editor} showAiTools={true} />
    </>
  );
};

export { BlockEditor, type BlockEditorProps };
