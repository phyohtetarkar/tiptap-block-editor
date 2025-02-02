import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Editor } from "@tiptap/core";
import {
  ArrowDownNarrowWideIcon,
  ArrowUpNarrowWideIcon,
  ChevronDownIcon,
  EraserIcon,
  PencilLineIcon,
  RefreshCcwDotIcon,
  SparklesIcon,
} from "lucide-react";

const items = [
  {
    group: "Edit or review selection",
    commands: [
      {
        title: "Improve writing",
        command: "improve",
        icon: RefreshCcwDotIcon,
      },
      {
        title: "Fix grammar",
        command: "fix grammar",
        icon: EraserIcon,
      },
      {
        title: "Make shorter",
        command: "make shorter",
        icon: ArrowDownNarrowWideIcon,
      },
      {
        title: "Make longer",
        command: "make longer",
        icon: ArrowUpNarrowWideIcon,
      },
    ],
  },
  {
    group: "Use AI to do more",
    commands: [
      {
        title: "Continue writing",
        command: "continue writing",
        icon: PencilLineIcon,
      },
    ],
  },
];

export const AiSelector = ({ editor }: { editor: Editor }) => {
  const handleCommandClick = (command: string) => {
    editor.chain().focus().aiCompletion({ command }).run();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="rounded-none text-primary">
          <SparklesIcon className="size-4 me-2" strokeWidth={2.2} />
          <span className="me-2">AI Tools</span>
          <ChevronDownIcon className="size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-1 shadow-xl w-56"
        align="start"
        noPortal
      >
        {items.map((item, i) => {
          return (
            <div key={i} className="flex flex-col">
              <h6 className="text-muted-foreground font-medium text-xs p-2">
                {item.group}
              </h6>
              {item.commands.map((c, j) => {
                return (
                  <div
                    key={j}
                    onClick={() => {
                      handleCommandClick(c.command);
                    }}
                    className="flex space-x-2 items-center rounded-md hover:bg-accent px-2 py-1.5 text-accent-foreground cursor-pointer"
                  >
                    <c.icon className="size-4 text-primary" />
                    <span className="text-sm">{c.title}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </PopoverContent>
    </Popover>
  );
};
