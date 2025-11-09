import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { PluginKey, TextSelection } from "@tiptap/pm/state";
import {
  CellSelection,
  deleteCellSelection
} from "@tiptap/pm/tables";
import { Editor, useEditorState } from "@tiptap/react";
import { EllipsisIcon, EllipsisVerticalIcon, EqualIcon } from "lucide-react";
import { useMemo, useState } from "react";
import {
  columnMenuPluginKey,
  rowMenuPluginKey,
  TableMenuHandle,
  TableMenuHandleProps,
  TableSelectionOverlay,
  TableSelectionOverlayProps,
} from "../extensions/table";

interface CellMenusState {
  canMergeCell: boolean;
  canSplitCell: boolean;
  canClearContents: boolean;
}

const ColumnMenuPopover = ({ editor }: { editor: Editor }) => {
  const [opened, setOpened] = useState(false);
  return (
    <DropdownMenu
      modal
      onOpenChange={(open) => {
        setOpened(open);
        editor
          .chain()
          .command(({ tr }) => {
            tr.setMeta(columnMenuPluginKey, { openedMenu: open });
            return true;
          })
          .run();
      }}
    >
      <DropdownMenuTrigger
        className={cn("w-full h-3 rounded flex items-center justify-center", {
          "bg-primary text-primary-foreground": opened,
          "bg-secondary hover:bg-secondary/70 text-secondary-foreground":
            !opened,
        })}
      >
        <EllipsisIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="max-h-80 w-40 overflow-hidden overflow-y-auto rounded border shadow-xl"
        align="start"
        // style={{
        //   width: "var(--radix-dropdown-menu-trigger-width)"
        // }}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              editor.chain().focus().addColumnBefore().run();
            }}
          >
            Add column before
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              editor.chain().focus().addColumnAfter().run();
            }}
          >
            Add column after
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive hover:text-destructive focus:text-destructive"
            onClick={() => {
              editor.chain().focus().deleteColumn().run();
            }}
          >
            Delete column
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const RowMenuPopover = ({ editor }: { editor: Editor }) => {
  const [opened, setOpened] = useState(false);
  return (
    <DropdownMenu
      modal
      onOpenChange={(open) => {
        setOpened(open);
        editor
          .chain()
          .command(({ tr }) => {
            tr.setMeta(rowMenuPluginKey, { openedMenu: open });
            return true;
          })
          .run();
      }}
    >
      <DropdownMenuTrigger
        className={cn("w-3 rounded flex items-center justify-center h-full", {
          "bg-primary text-primary-foreground": opened,
          "text-secondary-foreground bg-secondary hover:bg-secondary/70":
            !opened,
        })}
      >
        <EllipsisVerticalIcon className="size-4 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="max-h-80 w-40 overflow-hidden overflow-y-auto rounded border shadow-xl"
        align="start"
        side="right"
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              editor.chain().focus().addRowBefore().run();
            }}
          >
            Add row before
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              editor.chain().focus().addRowAfter().run();
            }}
          >
            Add row after
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive hover:text-destructive focus:text-destructive"
            onClick={() => {
              editor.chain().focus().deleteRow().run();
            }}
          >
            Delete row
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const CellMenuPopover = ({ editor }: { editor: Editor }) => {
  const [opened, setOpened] = useState(false);
  const { canMergeCell, canSplitCell, canClearContents } =
    useEditorState<CellMenusState>({
      editor: editor,
      equalityFn: (a, b) => {
        return (
          a.canMergeCell === b?.canMergeCell &&
          a.canSplitCell === b.canSplitCell &&
          a.canClearContents === b.canClearContents
        );
      },
      selector: (instance) => {
        const editor = instance.editor;
        const { selection } = editor.state;
        const { from, to, ranges } = selection;
        if (!instance.editor.isActive("table")) {
          return {
            canMergeCell: false,
            canSplitCell: false,
            canClearContents: false,
          };
        }

        let hasSpannedCell = false;
        let cellSelectionCount = 0;
        let selectionContentSize = 0;

        if (selection instanceof TextSelection) {
          editor.state.doc.nodesBetween(from, to, (node, pos) => {
            const nodeName = node.type.name;
            if (nodeName === "tableHeader" || nodeName === "tableCell") {
              const cell = editor.view.nodeDOM(pos) as HTMLTableCellElement;
              hasSpannedCell = cell.colSpan > 1 || cell.rowSpan > 1;
              return false;
            }
            return true;
          });
        }

        if (selection instanceof CellSelection) {
          cellSelectionCount = selection.ranges.length;
          for (const range of ranges) {
            const { $from, $to } = range;
            editor.state.doc.nodesBetween($from.pos, $to.pos, (node) => {
              if (node.isTextblock) {
                selectionContentSize += node.content.size;
              }
              return true;
            });
          }
        }

        return {
          canMergeCell: cellSelectionCount > 1,
          canSplitCell: hasSpannedCell,
          canClearContents: selectionContentSize > 0,
        };
      },
    });

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        setOpened(open);
      }}
    >
      <DropdownMenuTrigger
        className={cn(
          "absolute flex items-center justify-center top-1/2 -translate-y-1/2 hover:-right-[9px] bg-primary size-2 hover:size-4 rounded-full cursor-pointer pointer-events-auto",
          {
            "size-4 -right-[9px]": opened,
            "-right-[5px]": !opened,
          }
        )}
      >
        <EqualIcon
          className={cn(
            "size-3.5 text-primary-foreground opacity-0 hover:opacity-100",
            {
              "opacity-100": opened,
            }
          )}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="flex max-h-80 w-40 flex-col overflow-hidden overflow-y-auto rounded border shadow-xl"
        align="start"
        side="bottom"
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            hidden={!canMergeCell}
            onClick={() => {
              editor.chain().focus().mergeCells().run();
            }}
          >
            Merge cells
          </DropdownMenuItem>
          <DropdownMenuItem
            hidden={!canSplitCell}
            onClick={() => {
              editor.chain().focus().splitCell().run();
            }}
          >
            Split cell
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              editor.chain().focus().toggleHeaderCell().run();
            }}
          >
            Toggle header cell
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Alignment</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => {
                    editor
                      .chain()
                      .focus()
                      .setCellAttribute("verticalAlign", "top")
                      .run();
                  }}
                >
                  Align top
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                   editor
                      .chain()
                      .focus()
                      .setCellAttribute("verticalAlign", "middle")
                      .run();
                  }}
                >
                  Align middle
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    editor
                      .chain()
                      .focus()
                      .setCellAttribute("verticalAlign", "bottom")
                      .run();
                  }}
                >
                  Align bottom
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem
            hidden={!canClearContents}
            onClick={() => {
              editor
                .chain()
                .focus()
                .command(({ state, dispatch }) => {
                  return deleteCellSelection(state, dispatch);
                })
                .run();
            }}
          >
            Clear contents
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const TableHandle = ({ editor }: { editor: Editor | null }) => {
  const columnMenuPluginProps = useMemo(() => {
    if (!editor) {
      return undefined;
    }
    return {
      editor,
      menuType: "column",
      pluginKey: columnMenuPluginKey,
      options: {
        placement: "top-start",
        offset: {
          mainAxis: 4,
        },
      },
    } satisfies TableMenuHandleProps["pluginProps"];
  }, [editor]);

  const rowMenuPluginProps = useMemo(() => {
    if (!editor) {
      return undefined;
    }
    return {
      editor,
      menuType: "row",
      pluginKey: rowMenuPluginKey,
      options: {
        placement: "left-start",
        offset: {
          mainAxis: 4,
        },
      },
    } satisfies TableMenuHandleProps["pluginProps"];
  }, [editor]);

  const tableSelectionOverlayProps = useMemo(() => {
    if (!editor) {
      return undefined;
    }
    return {
      editor,
      pluginKey: new PluginKey("table-selection-overlay"),
    } satisfies TableSelectionOverlayProps["pluginProps"];
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <>
      {columnMenuPluginProps && (
        <TableMenuHandle pluginProps={columnMenuPluginProps}>
          <ColumnMenuPopover editor={editor} />
        </TableMenuHandle>
      )}
      {rowMenuPluginProps && (
        <TableMenuHandle pluginProps={rowMenuPluginProps}>
          <RowMenuPopover editor={editor} />
        </TableMenuHandle>
      )}

      {tableSelectionOverlayProps && (
        <TableSelectionOverlay pluginProps={tableSelectionOverlayProps}>
          <CellMenuPopover editor={editor} />
        </TableSelectionOverlay>
      )}
    </>
  );
};
