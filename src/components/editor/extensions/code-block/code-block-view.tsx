import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewProps,
} from "@tiptap/react";
import { common } from "lowlight";
import { ChevronDownIcon, CopyIcon, Trash2Icon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const CodeBlockView = ({
  editor,
  extension,
  node,
  getPos,
}: ReactNodeViewProps) => {
  const lineContainerRef = useRef<HTMLDivElement | null>(null);

  const [search, setSearch] = useState("");
  const [isCopied, setCopied] = useState(false);
  const [lineCount, setLineCount] = useState(0);

  const languages = useMemo(() => {
    const list: string[] = [];
    for (const l in common) {
      list.push(l);
    }
    return list;
  }, []);

  useEffect(() => {
    setLineCount(node.textContent.split("\n").length);
  }, [node.textContent]);

  const languageClassPrefix = extension.options.languageClassPrefix ?? "";
  const language = node.attrs.language;

  return (
    <NodeViewWrapper>
      <div className="flex items-center space-x-4 px-3 py-1.5 border border-b-0 rounded rounded-b-none bg-gray-700">
        <Popover
          onOpenChange={(op) => {
            if (op) {
              setSearch("");
            }
          }}
        >
          <PopoverTrigger>
            {language && (
              <div className="flex space-x-1 text-gray-400 hover:text-gray-100 items-center">
                {language}
                <ChevronDownIcon className="size-4 ms-1 text-default-foreground" />
              </div>
            )}
          </PopoverTrigger>
          <PopoverContent className="w-40 p-0 shadow-xl" align="start">
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
        <button
          type="button"
          className="text-gray-400 hover:text-gray-100 ms-auto"
          disabled={isCopied}
          onClick={() => {
            if (isCopied) {
              return;
            }
            navigator.clipboard.writeText(node.textContent).then(() => {
              setCopied(true);
              setTimeout(() => {
                setCopied(false);
              }, 2000);
            });
          }}
        >
          {isCopied ? (
            <span className="text-sm">Copied</span>
          ) : (
            <CopyIcon className="size-4" />
          )}
        </button>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-100"
          disabled={isCopied}
          onClick={() => {
            const pos = getPos();
            if (pos === undefined) {
              return;
            }
            editor
              .chain()
              .focus()
              .command(({ tr }) => {
                tr.delete(pos, pos + node.nodeSize);
                return true;
              })
              .run();
          }}
        >
          <Trash2Icon className="size-4" />
        </button>
      </div>
      <div className="h-[1px] bg-gray-600 border-x" />
      <div
        className={cn(
          "flex !bg-gray-800 dark:!bg-gray-900 text-gray-200 overflow-x-auto",
          "rounded rounded-t-none border border-t-0",
          "font-mono font-medium text-sm text-[15px]"
        )}
        style={{
          lineHeight: 1.5,
        }}
      >
        <div
          ref={lineContainerRef}
          className={cn(
            "h-full bg-gray-800 dark:bg-gray-900 py-3",
            "sticky left-0 top-0 bottom-0 ps-5 pe-2",
            "text-end font-mono text-gray-400/80"
          )}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className={cn("not-prose p-3 ps-0")}>
          <code className={language ? languageClassPrefix + language : null}>
            <NodeViewContent className="!text-nowrap" />
          </code>
        </pre>
      </div>
    </NodeViewWrapper>
  );
};

export default CodeBlockView;
