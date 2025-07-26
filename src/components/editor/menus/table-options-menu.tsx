import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Editor } from "@tiptap/react";
import {
  Columns,
  MoreHorizontal,
  RectangleHorizontal,
  Rows,
} from "lucide-react";
import { TableMenu } from "../extensions/table";

export const TableOptionsMenu = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  const menuItemClass = cn(
    "px-2 py-1.5 text-sm hover:bg-accent rounded-md text-start"
  );

  return (
    <TableMenu
      editor={editor}
      options={{
        placement: "top-end",
      }}
      className={cn("flex w-fit max-w-[90vw] space-x-0.5")}
    >
      <TooltipProvider delayDuration={300}>
        <Popover>
          <Tooltip>
            <PopoverTrigger asChild>
              <TooltipTrigger asChild>
                <Button
                  className="drop-shadow-lg bg-background dark:bg-background dark:hover:bg-accent"
                  variant="outline"
                  size="icon"
                >
                  <Columns className="size-5" />
                </Button>
              </TooltipTrigger>
            </PopoverTrigger>
            <TooltipContent>Column</TooltipContent>
          </Tooltip>
          <PopoverContent
            className="flex max-h-80 w-40 p-1 flex-col overflow-hidden overflow-y-auto rounded border shadow-xl"
            align="end"
          >
            <div className="flex flex-col">
              <button
                onClick={() => {
                  editor.chain().focus().addColumnBefore().run();
                }}
                className={menuItemClass}
                type="button"
              >
                Add column before
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().addColumnAfter().run();
                }}
                className={menuItemClass}
                type="button"
              >
                Add column after
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().deleteColumn().run();
                }}
                className={cn([menuItemClass], "text-destructive")}
                type="button"
              >
                Delete column
              </button>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <Tooltip>
            <PopoverTrigger asChild>
              <TooltipTrigger asChild>
                <Button
                  className="drop-shadow-lg bg-background dark:bg-background dark:hover:bg-accent"
                  variant="outline"
                  size="icon"
                >
                  <Rows className="size-5" />
                </Button>
              </TooltipTrigger>
            </PopoverTrigger>
            <TooltipContent>Row</TooltipContent>
          </Tooltip>
          <PopoverContent
            className="flex max-h-80 w-40 p-1 flex-col overflow-hidden overflow-y-auto rounded border shadow-xl"
            align="end"
          >
            <div className="flex flex-col">
              <button
                onClick={() => {
                  editor.chain().focus().addRowBefore().run();
                }}
                className={menuItemClass}
                type="button"
              >
                Add row before
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().addRowAfter().run();
                }}
                className={menuItemClass}
                type="button"
              >
                Add row after
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().deleteRow().run();
                }}
                className={cn([menuItemClass], "text-destructive")}
                type="button"
              >
                Delete row
              </button>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <Tooltip>
            <PopoverTrigger asChild>
              <TooltipTrigger asChild>
                <Button
                  className="drop-shadow-lg bg-background dark:bg-background dark:hover:bg-accent"
                  variant="outline"
                  size="icon"
                >
                  <RectangleHorizontal className="size-5" />
                </Button>
              </TooltipTrigger>
            </PopoverTrigger>
            <TooltipContent>Cell</TooltipContent>
          </Tooltip>
          <PopoverContent
            className="flex max-h-80 w-40 p-1 flex-col overflow-hidden overflow-y-auto rounded border shadow-xl"
            align="end"
          >
            <div className="flex flex-col">
              <button
                onClick={() => {
                  editor.chain().focus().mergeCells().run();
                }}
                className={menuItemClass}
                type="button"
              >
                Merge cells
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().splitCell().run();
                }}
                className={menuItemClass}
                type="button"
              >
                Split cell
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().toggleHeaderCell().run();
                }}
                className={menuItemClass}
                type="button"
              >
                Toggle header cell
              </button>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <Tooltip>
            <PopoverTrigger asChild>
              <TooltipTrigger asChild>
                <Button
                  className="drop-shadow-lg bg-background dark:bg-background dark:hover:bg-accent"
                  variant="outline"
                  size="icon"
                >
                  <MoreHorizontal className="size-5" />
                </Button>
              </TooltipTrigger>
            </PopoverTrigger>
            <TooltipContent>Options</TooltipContent>
          </Tooltip>
          <PopoverContent
            className="flex max-h-80 w-40 p-1 flex-col overflow-hidden overflow-y-auto rounded border shadow-xl"
            align="end"
          >
            <div className="flex flex-col">
              <button
                onClick={() => {
                  editor.chain().focus().toggleHeaderRow().run();
                }}
                className={menuItemClass}
                type="button"
              >
                Toggle header row
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().toggleHeaderColumn().run();
                }}
                className={menuItemClass}
                type="button"
              >
                Toggle header col
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().deleteTable().run();
                }}
                className={cn([menuItemClass], "text-destructive")}
                type="button"
              >
                Delete table
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </TooltipProvider>
    </TableMenu>
  );
};
