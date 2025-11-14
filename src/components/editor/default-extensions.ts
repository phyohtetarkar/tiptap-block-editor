import { cn } from "@/lib/utils";
import { mergeAttributes } from "@tiptap/core";
import Heading from "@tiptap/extension-heading";
import Image from "@tiptap/extension-image";
import { TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Youtube from "@tiptap/extension-youtube";
import { CharacterCount } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import { AiPlaceholder } from "./extensions/ai-placeholder";
import { AiWriter } from "./extensions/ai-writer";
import { CustomCodeBlock } from "./extensions/code-block";
import { Mathematics } from "./extensions/mathematics";
import { CustomTable } from "./extensions/table";
import { Markdown } from "@tiptap/markdown";
import { Mermaid } from "./extensions/mermaid";

const TiptapStarterKit = StarterKit.configure({
  bulletList: {
    HTMLAttributes: {
      class: cn("list-disc list-outside leading-3 -mt-2"),
    },
  },
  orderedList: {
    HTMLAttributes: {
      class: cn("list-decimal list-outside leading-3 -mt-2"),
    },
  },
  listItem: {
    HTMLAttributes: {
      class: cn("leading-normal -mb-2"),
    },
  },
  blockquote: {
    HTMLAttributes: {
      class: cn("border-l-4 border-gray-600"),
    },
  },
  codeBlock: false,
  code: {
    HTMLAttributes: {
      class: cn(
        "rounded-lg bg-muted text-red-700 dark:bg-muted/90 dark:text-red-400 px-1.5 py-1 font-mono font-medium before:content-none after:content-none"
      ),
      spellcheck: "false",
    },
  },
  horizontalRule: {
    HTMLAttributes: {
      class: cn("my-4 bg-border border-border"),
    },
  },
  dropcursor: {
    color: "#DBEAFE",
    width: 4,
  },
  // gapcursor: false,
  heading: false,
  link: {
    HTMLAttributes: {
      class: cn(
        "!text-foreground underline underline-offset-[3px] transition-colors cursor-pointer"
      ),
    },
    openOnClick: false,
  },
});

const TiptapHeading = Heading.extend({
  renderHTML({ node, HTMLAttributes }) {
    const hasLevel = this.options.levels.includes(node.attrs.level);
    const level = hasLevel ? node.attrs.level : this.options.levels[0];

    if (node.textContent) {
      return [
        `h${level}`,
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
          id: node.textContent.replaceAll(/\s+/g, "-").toLowerCase(),
        }),
        0,
      ];
    }
    return [
      `h${level}`,
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },
});

const mathematics = Mathematics.configure({
  HTMLAttributes: {
    class: cn("text-foreground rounded p-1 hover:bg-accent cursor-pointer"),
  },
});

const lowlight = createLowlight(common);
const codeBlock = CustomCodeBlock.configure({
  HTMLAttributes: {
    class: cn(
      "rounded !bg-gray-800 dark:!bg-gray-900 text-gray-200 border p-5 font-mono font-medium"
    ),
    spellcheck: false,
  },
  enableTabIndentation: true,
  tabSize: 2,
  defaultLanguage: "plaintext",
  lowlight: lowlight,
});

const TiptapTextAlign = TextAlign.configure({
  types: ["heading", "paragraph", "math"],
});

const TiptapTable = CustomTable.configure({
  HTMLAttributes: {
    class: cn("table-auto border-collapse w-full not-prose"),
  },
  lastColumnResizable: false,
  allowTableNodeSelection: true,
  resizable: true,
});

const TiptapTableHeader = TableHeader.configure({
  HTMLAttributes: {
    class: cn(
      "bg-muted dark:bg-gray-900 border border-default p-2 text-start min-w-[150px] font-semibold"
    ),
  },
});

const TiptapTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      verticalAlign: {
        default: "top",
        parseHTML: (element) => {
          return element.style.verticalAlign || "top";
        },
        renderHTML: (attributes) => {
          return { style: `vertical-align: ${attributes.verticalAlign}` };
        },
      },
    };
  },
}).configure({
  HTMLAttributes: {
    class: cn("border border-default p-2 min-w-[150px]"),
  },
});

const TiptapImage = Image.configure({
  allowBase64: false,
  HTMLAttributes: {
    class: cn("rounded border mx-auto"),
  },
});

const aiPlaceholder = AiPlaceholder.configure({
  HTMLAttributes: {
    class: cn("!text-muted-foreground not-draggable"),
  },
});

const aiWriter = AiWriter.configure({
  HTMLAttributes: {
    class: cn("py-3 px-1 select-none"),
  },
});

const TipTapMarkdown = Markdown.configure({
  indentation: {
    style: "tab", // 'space' or 'tab'
    size: 1, // Number of spaces or tabs
  },
  markedOptions: {
    gfm: true, // GitHub Flavored Markdown
    breaks: false, // Convert \n to <br>
    pedantic: false, // Strict Markdown mode
  },
});

const TiptapYoutube = Youtube.configure({
  HTMLAttributes: {
    class: cn("border border-muted"),
  },
  nocookie: true,
});

const TiptapCharacterCount = CharacterCount;

const mermaid = Mermaid.configure({
  HTMLAttributes: {
    class: cn("mermaid p-4 bg-white"),
  },
});

// const selection = Selection.configure({
//   HTMLAttributes: {
//     class: "selection",
//   },
// });

export const defaultExtensions = [
  TiptapStarterKit,
  TiptapHeading,
  TiptapTextAlign,
  TiptapTable,
  TiptapTableHeader,
  TableRow,
  TiptapTableCell,
  TiptapYoutube,
  TiptapCharacterCount,
  TiptapImage,
  TextStyle,
  mathematics,
  codeBlock,
  aiPlaceholder,
  aiWriter,
  TipTapMarkdown,
  mermaid,
];
