import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { NodeViewProps } from "@tiptap/core";
import { NodeViewWrapper, useEditorState } from "@tiptap/react";
import { CheckIcon, LoaderCircleIcon } from "lucide-react";
import { useRef } from "react";
import Markdown from "react-markdown";
import { AiStorage } from "../ai";

const AiWriterView = ({ editor, node, getPos }: NodeViewProps) => {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const { message, status, error } = useEditorState({
    editor: editor,
    selector: (instance) => {
      const storage = instance.editor.storage.ai as AiStorage;
      return {
        status: storage.status,
        message: storage.message,
        error: storage.error,
      };
    },
  });

  const insert = () => {
    if (!message) {
      return;
    }

    const from = getPos();
    const to = from + node.nodeSize;

    editor.chain().focus().insertContentAt({ from, to }, message).run();
  };

  const remove = () => {
    const from = getPos();
    const to = from + node.nodeSize;
    editor.chain().focus().deleteRange({ from, to }).run();
  };

  const isLoading = status === "loading";
  const isSuccess = status === "success";

  return (
    <NodeViewWrapper>
      <div className="ai-writer flex flex-col py-4 px-5 rounded-md border bg-card not-draggable select-none">
        {error && (
          <Alert variant="destructive" className="mb-4">
            {error.message}
          </Alert>
        )}

        {!error && !!message && (
          <>
            <label className="mb-1 font-medium text-foreground">Preview</label>
            <div className="flex max-h-80">
              <ScrollArea className="prose dark:prose-invert prose-headings:mt-0 max-w-full mb-6 prose-pre:rounded-md prose-pre:bg-gray-800 dark:prose-pre:bg-gray-900">
                <Markdown>{message}</Markdown>
              </ScrollArea>
            </div>
          </>
        )}
        <form
          onSubmit={(evt) => {
            evt.preventDefault();
            const prompt = inputRef.current?.value;

            if (!prompt?.trim()) {
              return;
            }

            editor.commands.aiTextPrompt({
              prompt: prompt,
              command: "prompt",
              insert: false,
            });
          }}
        >
          <Label className="mb-1">Prompt</Label>
          <Textarea
            ref={inputRef}
            name="prompt"
            placeholder="Enter your prompt"
            rows={3}
          />
          <div className="flex items-center mt-4">
            <Button
              type="button"
              variant="destructive"
              className="me-2"
              disabled={isLoading}
              onClick={remove}
            >
              Remove
            </Button>
            <div className="flex-1"></div>
            {isSuccess && (
              <Button
                type="button"
                variant="ghost"
                className="me-2 text-muted-foreground"
                disabled={isLoading}
                onClick={insert}
              >
                <CheckIcon className="me-2 size-4" strokeWidth={2.5} />
                Insert
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Generate
            </Button>
          </div>
        </form>
      </div>
    </NodeViewWrapper>
  );
};

export default AiWriterView;
