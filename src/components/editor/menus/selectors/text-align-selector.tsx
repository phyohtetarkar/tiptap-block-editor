import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  CheckIcon,
  ChevronDownIcon,
} from "lucide-react";

interface SelectorResult {
  isLeft: boolean;
  isCenter: boolean;
  isRight: boolean;
}

const items = [
  {
    title: "Left",
    icon: AlignLeftIcon,
    onClick: (editor: Editor) =>
      editor.chain().focus().setTextAlign("left").run(),
    isActive: (state: SelectorResult) => state.isLeft,
  },
  {
    title: "Center",
    icon: AlignCenterIcon,
    onClick: (editor: Editor) =>
      editor.chain().focus().setTextAlign("center").run(),
    isActive: (state: SelectorResult) => state.isCenter,
  },
  {
    title: "Right",
    icon: AlignRightIcon,
    onClick: (editor: Editor) =>
      editor.chain().focus().setTextAlign("right").run(),
    isActive: (state: SelectorResult) => state.isRight,
  },
];

export const TextAlignSelector = ({ editor }: { editor: Editor }) => {
  const editorState = useEditorState<SelectorResult>({
    editor,
    selector: (instance) => ({
      isLeft: instance.editor.isActive({ textAlign: "left" }),
      isCenter: instance.editor.isActive({ textAlign: "center" }),
      isRight: instance.editor.isActive({ textAlign: "right" }),
    }),
  });

  const activeItem =
    items.find((item) => item.isActive(editorState)) ?? items[0]!;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="rounded-none">
          <activeItem.icon className="size-4 me-2" strokeWidth={2.5} />
          <ChevronDownIcon className="size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-1 shadow-xl w-32" align="end" noPortal>
        {items.map((item, i) => {
          return (
            <div
              key={i}
              onClick={() => item.onClick(editor)}
              className="flex space-x-2 items-center rounded-md hover:bg-accent px-2 py-1.5 text-accent-foreground cursor-pointer"
            >
              <item.icon className="size-4" />
              <span className="text-sm">{item.title}</span>
              <div className="flex-1"></div>
              {item.isActive(editorState) && <CheckIcon className="size-3.5" />}
            </div>
          );
        })}
      </PopoverContent>
    </Popover>
  );
};
