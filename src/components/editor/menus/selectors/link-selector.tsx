import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { CheckIcon, LinkIcon, Trash2Icon } from "lucide-react";
import { useRef } from "react";

export const LinkSelector = ({ editor }: { editor: Editor }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const editorState = useEditorState({
    editor,
    selector: (instance) => ({
      isLink: instance.editor.isActive("link"),
      getLink: instance.editor.getAttributes("link").href,
      isMath: instance.editor.isActive("math"),
    }),
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-none flex-shrink-0"
          disabled={editorState.isMath}
        >
          <LinkIcon
            className={cn("size-4", {
              "text-primary": editorState.isLink,
            })}
            strokeWidth={2.5}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-fit shadow-xl rounded-md border p-1"
        align="end"
        noPortal
      >
        <form
          className="flex space-x-1 items-center"
          onSubmit={(evt) => {
            evt.preventDefault();
            const url = inputRef.current?.value;
            if (!url) {
              return;
            }
            editor
              .chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href: url })
              .run();
          }}
        >
          <Input
            ref={inputRef}
            placeholder="Paste a link..."
            defaultValue={editorState.getLink}
          />
          {editorState.isLink ? (
            <Button
              variant="destructive"
              size="icon"
              type="button"
              onClick={() => {
                editor.chain().focus().unsetLink().run();
                if (inputRef.current) {
                  inputRef.current.value = "";
                }
              }}
            >
              <Trash2Icon className="size-4" />
            </Button>
          ) : (
            <Button size="icon">
              <CheckIcon className="size-4" />
            </Button>
          )}
        </form>
      </PopoverContent>
    </Popover>
  );
};
