import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import {
  CheckIcon,
  ChevronDownIcon,
  Heading1,
  Heading2,
  Heading3,
  LetterTextIcon,
  List,
  ListOrdered,
  LucideIcon,
  QuoteIcon,
} from "lucide-react";

interface SelectorResult {
  isParagraph: boolean;
  isHeading1: boolean;
  isHeading2: boolean;
  isHeading3: boolean;
  isBulletList: boolean;
  isOrderedList: boolean;
  isBlockquote: boolean;
}

interface MenuItem {
  name: string;
  icon: LucideIcon;
  onClick: (editor: Editor) => void;
  isActive: (state: SelectorResult) => boolean;
}

const items: MenuItem[] = [
  {
    name: "Text",
    icon: LetterTextIcon,
    onClick: (editor) =>
      editor.chain().focus().toggleNode("paragraph", "paragraph").run(),
    isActive: (state) =>
      state.isParagraph && !state.isBulletList && !state.isOrderedList,
  },
  {
    name: "Heading 1",
    icon: Heading1,
    onClick: (editor) =>
      editor.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: (state) => state.isHeading1,
  },
  {
    name: "Heading 2",
    icon: Heading2,
    onClick: (editor) =>
      editor.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (state) => state.isHeading2,
  },
  {
    name: "Heading 3",
    icon: Heading3,
    onClick: (editor) =>
      editor.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (state) => state.isHeading3,
  },
  // {
  //   name: "To-do List",
  //   icon: CheckSquare,
  //   onClick: (editor) => editor!.chain().focus().toggleTaskList().run(),
  //   isActive: (editor) => editor!.isActive("taskItem"),
  // },
  {
    name: "Bullet List",
    icon: List,
    onClick: (editor) => editor.chain().focus().toggleBulletList().run(),
    isActive: (state) => state.isBulletList,
  },
  {
    name: "Numbered List",
    icon: ListOrdered,
    onClick: (editor) => editor.chain().focus().toggleOrderedList().run(),
    isActive: (state) => state.isOrderedList,
  },
  {
    name: "Quote",
    icon: QuoteIcon,
    onClick: (editor) =>
      editor
        .chain()
        .focus()
        .toggleNode("paragraph", "paragraph")
        .toggleBlockquote()
        .run(),
    isActive: (state) => state.isBlockquote,
  },
  // {
  //   name: "Code",
  //   icon: Code,
  //   onClick: (editor) => editor.chain().focus().toggleCode().run(),
  //   isActive: (state) => state.isCode,
  // },
];

export const NodeSelector = ({ editor }: { editor: Editor }) => {
  const editorState = useEditorState<SelectorResult>({
    editor,
    selector: (instance) => ({
      isParagraph: instance.editor.isActive("paragraph"),
      isHeading1: instance.editor.isActive("heading", { level: 1 }),
      isHeading2: instance.editor.isActive("heading", { level: 2 }),
      isHeading3: instance.editor.isActive("heading", { level: 3 }),
      isBulletList: instance.editor.isActive("bulletList"),
      isOrderedList: instance.editor.isActive("orderedList"),
      isBlockquote: instance.editor.isActive("blockquote"),
    }),
  });

  const activeItems = items.filter((item) => item.isActive(editorState));

  const name =
    activeItems.length > 1 ? "Multiple" : activeItems.pop()?.name ?? "Text";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="rounded-none">
          <span className="whitespace-nowrap text-sm me-2">{name}</span>
          <ChevronDownIcon className="size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-48 p-1 shadow-xl"
        align="start"
        noPortal
      >
        {items.map((item, i) => {
          return (
            <div
              key={i}
              onClick={() => item.onClick(editor)}
              className="flex items-center text-sm rounded-md hover:bg-accent text-accent-foreground px-2 py-1.5 cursor-pointer"
            >
              <item.icon className="size-3.5 me-2" />
              <span>{item.name}</span>
              <div className="flex-1"></div>
              {item.isActive(editorState) && (
                <CheckIcon className="size-3.5 ms-4" />
              )}
            </div>
          );
        })}
      </PopoverContent>
    </Popover>
  );
};
