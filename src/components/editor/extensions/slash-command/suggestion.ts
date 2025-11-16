import { computePosition, flip, shift } from "@floating-ui/dom";
import { Editor, posToDOMRect, ReactRenderer } from "@tiptap/react";
import { SuggestionOptions } from "@tiptap/suggestion";
import {
  ChartPieIcon,
  CodeIcon,
  DivideIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  LetterTextIcon,
  ListIcon,
  ListOrderedIcon,
  ShapesIcon,
  SparklesIcon,
  SquarePlayIcon,
  TableIcon,
  TextQuoteIcon,
} from "lucide-react";
import { SlashCommandNodeAttrs } from "./slash-command";
import SuggestionList, {
  CommandSuggestionItem,
  SuggestionListHandle,
  SuggestionListProps,
} from "./suggestion-list";

type SuggestionType = Omit<
  SuggestionOptions<CommandSuggestionItem, SlashCommandNodeAttrs>,
  "editor"
>;

const list: CommandSuggestionItem[] = [
  {
    id: "text",
    title: "Text",
    description: "Just start typing with plain text.",
    keywords: ["p", "paragraph"],
    icon: LetterTextIcon,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .run();
    },
  },
  {
    id: "h1",
    title: "Heading 1",
    description: "Big section heading.",
    keywords: ["title", "big", "large", "heading"],
    icon: Heading1Icon,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
  },
  {
    id: "h2",
    title: "Heading 2",
    description: "Medium section heading.",
    keywords: ["subtitle", "medium", "heading"],
    icon: Heading2Icon,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    id: "h3",
    title: "Heading 3",
    description: "Small section heading.",
    keywords: ["subtitle", "small", "heading"],
    icon: Heading3Icon,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },
  {
    id: "ul",
    title: "Bullet List",
    description: "Create a simple bullet list.",
    keywords: ["unordered", "list", "bullet"],
    icon: ListIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    id: "ol",
    title: "Numbered List",
    description: "Create a list with numbering.",
    keywords: ["ordered", "list"],
    icon: ListOrderedIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    id: "blockquote",
    title: "Quote",
    description: "Capture a quote.",
    keywords: ["blockquote"],
    icon: TextQuoteIcon,
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .toggleBlockquote()
        .run(),
  },
  {
    id: "codeBlock",
    title: "Code",
    description: "Capture a code snippet.",
    keywords: ["codeblock"],
    icon: CodeIcon,
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleCodeBlock({ language: "plaintext" })
        .run(),
  },
  {
    id: "table",
    title: "Table",
    description: "Capture a table.",
    keywords: ["table"],
    icon: TableIcon,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).insertTable().run(),
  },
  {
    id: "mermaid",
    title: "Mermaid",
    description: "Render a mermaid diagram.",
    keywords: ["mermaid", "diagram"],
    icon: ShapesIcon,
    command: () => {},
  },
  {
    id: "chart",
    title: "Chart",
    description: "Render a chart.",
    keywords: ["chart"],
    icon: ChartPieIcon,
    command: () => {},
  },
  {
    id: "youtube",
    title: "Youtube",
    description: "Embed a Youtube video.",
    keywords: ["youtube"],
    icon: SquarePlayIcon,
    command: ({ editor, range }) => {
      const videoLink = prompt("Please enter Youtube Video Link");
      //From https://regexr.com/3dj5t
      const ytregex = new RegExp(
        /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/
      );

      if (videoLink && ytregex.test(videoLink)) {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setYoutubeVideo({
            src: videoLink,
          })
          .run();
      } else {
        if (videoLink !== null) {
          alert("Please enter a correct Youtube Video Link");
        }
      }
    },
  },
  {
    id: "divider",
    title: "Divider",
    description: "Create a horizontal divider.",
    keywords: ["divider"],
    icon: DivideIcon,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
];

const withAiList: CommandSuggestionItem[] = [
  {
    id: "aiWriter",
    title: "AI Writer",
    description: "Ask AI with custom prompt.",
    keywords: ["ai"],
    icon: SparklesIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setAiWriter().run();
    },
  },
  ...list,
];

const updatePosition = (editor: Editor, element: Element) => {
  if (!(element instanceof HTMLElement)) {
    return;
  }

  const virtualElement = {
    getBoundingClientRect: () => {
      return posToDOMRect(
        editor.view,
        editor.state.selection.from,
        editor.state.selection.to
      );
    },
  };

  computePosition(virtualElement, element, {
    placement: "bottom-start",
    strategy: "absolute",
    middleware: [shift(), flip()],
  }).then(({ x, y, strategy }) => {
    element.style.width = "max-content";
    element.style.position = strategy;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  });
};

const getSuggestion = ({ ai }: { ai?: boolean }): SuggestionType => {
  return {
    items: ({ query }) => {
      const filterFun = (item: CommandSuggestionItem) => {
        return item.keywords.some((k) => k.startsWith(query.toLowerCase()));
      };

      if (ai) {
        return withAiList.filter(filterFun);
      }
      return list.filter(filterFun);
    },
    render: () => {
      let component: ReactRenderer<SuggestionListHandle, SuggestionListProps>;
      // let popup: Instance | undefined;

      return {
        onStart: (props) => {
          component = new ReactRenderer(SuggestionList, {
            props,
            editor: props.editor,
          });

          if (!props.clientRect) {
            return;
          }

          if (component.element instanceof HTMLElement) {
            component.element.style.position = "absolute";

            document.body.appendChild(component.element);

            updatePosition(props.editor, component.element);
          }

          // const { element: editorElement } = props.editor.options;
          // // @ts-expect-error temporary
          // popup = tippy(editorElement, {
          //   getReferenceClientRect: props.clientRect,
          //   content: component.element,
          //   showOnCreate: true,
          //   interactive: true,
          //   trigger: "manual",
          //   placement: "bottom-start",
          //   popperOptions: {
          //     strategy: "absolute",
          //   },
          // });
        },

        onUpdate(props) {
          component.updateProps(props);

          if (!props.clientRect) {
            return;
          }

          updatePosition(props.editor, component.element);

          // popup?.setProps({
          //   // @ts-expect-error temporary
          //   getReferenceClientRect: props.clientRect,
          // });
        },

        onKeyDown(props) {
          if (props.event.key === "Escape") {
            // popup?.hide();
            //component.destroy();

            return true;
          }

          return component.ref?.onKeyDown(props) ?? false;
        },

        onExit() {
          // popup?.destroy();
          component?.element.remove();
          component?.destroy();
        },
      };
    },
  };
};

export { getSuggestion };
