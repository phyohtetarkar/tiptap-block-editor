import { Button } from "@/components/ui/button";
import { NodeViewWrapper, ReactNodeViewProps } from "@tiptap/react";
import { EditIcon, Trash2Icon } from "lucide-react";
import { useCallback, useState } from "react";
import { TreeDiagramInputDialog } from "./tree-diagram-input-dialog";
import { TreeDiagramRenderer } from "./tree-diagram-renderer";

export function TreeDiagramView({ editor, getPos, node }: ReactNodeViewProps) {
  const [openInputDialog, setOpenInputDialog] = useState(false);

  const deleteNode = useCallback(() => {
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
  }, [editor, getPos, node]);

  return (
    <NodeViewWrapper>
      <TreeDiagramRenderer treeData={node.textContent} />

      <div className="absolute flex space-x-1 top-2 right-2">
        <Button
          variant="secondary"
          size="icon"
          className="opacity-40 hover:opacity-100 size-7 bg-zinc-300! text-zinc-700!"
          onClick={() => setOpenInputDialog(true)}
        >
          <EditIcon />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          className="opacity-40 hover:opacity-100 size-7 bg-red-600!"
          onClick={deleteNode}
        >
          <Trash2Icon />
        </Button>
      </div>

      <TreeDiagramInputDialog
        value={node.textContent}
        isOpen={openInputDialog}
        onOpenChange={setOpenInputDialog}
        onInsert={(value) => {
          const pos = getPos();
          if (pos === undefined) {
            return;
          }
          editor
            .chain()
            .focus()
            .setNodeSelection(pos)
            .updateTreeDiagram({ data: value })
            .run();
          setOpenInputDialog(false);
        }}
      />
    </NodeViewWrapper>
  );
}
