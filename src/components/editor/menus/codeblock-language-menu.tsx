import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Editor } from "@tiptap/core";
import { FloatingMenu, useEditorState } from "@tiptap/react";
import { common } from "lowlight";
import { ChevronDownIcon } from "lucide-react";
import { useMemo, useState } from "react";

export const CodeBlockLanguageMenu = ({
  editor,
}: {
  editor: Editor | null;
}) => {
  const [search, setSearch] = useState<string>("");

  const editorState = useEditorState({
    editor,
    selector: (instance) => ({
      getLanguage: instance.editor?.getAttributes("codeBlock").language,
    }),
  });

  const languages = useMemo(() => {
    const list: string[] = [];
    for (const l in common) {
      list.push(l);
    }
    return list;
  }, []);

  if (!editor || !editorState) {
    return null;
  }

  return (
    <FloatingMenu
      editor={editor}
      tippyOptions={{
        placement: "top-end",
        appendTo: "parent",
        duration: 100,
        zIndex: 0,
        offset: [0, 8],
        getReferenceClientRect: () => {
          const { ranges } = editor.state.selection;
          const from = Math.min(...ranges.map((range) => range.$from.pos));
          const to = Math.max(...ranges.map((range) => range.$to.pos));

          let nodePos: number | undefined = undefined;

          editor.state.doc.nodesBetween(from, to, (node, p) => {
            if (node.type.name !== "codeBlock") {
              return;
            }

            nodePos = p;
            return false;
          });

          if (nodePos !== undefined) {
            const node = editor.view.nodeDOM(nodePos) as HTMLElement;

            if (node) {
              return node.getBoundingClientRect();
            }
          }

          return editor.view.dom.getBoundingClientRect();
        },
      }}
      className={cn("flex w-fit max-w-[90vw] space-x-0.5")}
      shouldShow={({ editor }) => {
        return editor.isActive("codeBlock");
      }}
    >
      <Popover
        onOpenChange={(op) => {
          if (op) {
            setSearch("");
          }
        }}
      >
        <PopoverTrigger asChild>
          {editorState.getLanguage && (
            <Button className="shadow-lg" variant="outline" size="sm">
              {editorState.getLanguage}
              <ChevronDownIcon className="size-4 ms-1 text-default-foreground" />
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-40 p-0 shadow-xl" align="end">
          <div className="p-1">
            <Input
              placeholder="Search..."
              className="h-9 focus-visible:ring-0 focus-visible:border-primary"
              type="search"
              value={search}
              onChange={(evt) => setSearch(evt.target.value)}
            />
          </div>
          <div className="flex max-h-[320px]">
            <ScrollArea className="grow p-1">
              {languages
                .filter((v) => {
                  if (!search) {
                    return true;
                  }
                  return v.toLowerCase().startsWith(search.toLowerCase());
                })
                .map((l, i) => {
                  return (
                    <div
                      key={i}
                      className="hover:bg-accent p-1 rounded-md cursor-pointer"
                      onClick={() => {
                        editor
                          .chain()
                          .focus(undefined, { scrollIntoView: false })
                          .toggleCodeBlock({ language: l })
                          .run();
                      }}
                    >
                      <span>{l}</span>
                    </div>
                  );
                })}
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    </FloatingMenu>
  );
};
