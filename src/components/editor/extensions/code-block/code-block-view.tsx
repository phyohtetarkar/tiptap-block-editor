import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewProps,
} from "@tiptap/react";
import { common } from "lowlight";
import { ChevronDownIcon, CopyIcon } from "lucide-react";
import { useMemo, useState } from "react";

const CodeBlockView = ({ editor, extension, node }: ReactNodeViewProps) => {
  const [search, setSearch] = useState("");
  const [isCopied, setCopied] = useState(false);
  const languages = useMemo(() => {
    const list: string[] = [];
    for (const l in common) {
      list.push(l);
    }
    return list;
  }, []);

  const languageClassPrefix = extension.options.languageClassPrefix ?? "";
  const language = node.attrs.language;
  return (
    <NodeViewWrapper>
      <div className="flex items-center space-x-4 mb-4">
        <Popover
          onOpenChange={(op) => {
            if (op) {
              setSearch("");
            }
          }}
        >
          <PopoverTrigger>
            {language && (
              <div className="flex space-x-1 text-gray-400 hover:text-gray-300 items-center">
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
          className="text-gray-400 hover:text-gray-300 ms-auto"
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
      </div>
      <code className={language ? languageClassPrefix + language : null}>
        <NodeViewContent className="!text-nowrap" />
      </code>
    </NodeViewWrapper>
  );
};

export default CodeBlockView;