import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NodeViewWrapper, ReactNodeViewProps } from "@tiptap/react";
import { EditIcon, Trash2Icon } from "lucide-react";
import mermaid from "mermaid";
import { useCallback, useEffect, useRef, useState } from "react";
import { MermaidInputDialog } from "./mermaid-input-dialog";
import { Alert } from "@/components/ui/alert";

export function MermaidView({
  editor,
  getPos,
  node,
  HTMLAttributes,
  extension,
}: ReactNodeViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [openMermaidInputDialog, setOpenMermaidInputDialog] = useState(false);
  const [error, setError] = useState<string>();

  const { options } = extension;

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

  const renderDiagram = useCallback(async () => {
    try {
      const id = "m-" + crypto.randomUUID();
      const result = await mermaid.render(id, node.textContent);
      if (containerRef.current) {
        containerRef.current.innerHTML = result.svg;
      }
    } catch (error: any) {
      console.error(error);
      setError(error.message);
    }
  }, [node]);

  useEffect(() => {
    renderDiagram();
  }, [renderDiagram]);

  return (
    <NodeViewWrapper>
      {error ? (
        <div className="w-full p-2">
          <Alert variant="destructive" className="mt-10">
            {error}
          </Alert>
        </div>
      ) : (
        <div
          ref={containerRef}
          className={cn(options.HTMLAttributes.class, HTMLAttributes.class)}
        ></div>
      )}
      <div className="absolute flex space-x-1 top-2 right-2">
        <Button
          variant="secondary"
          size="icon"
          className="opacity-40 hover:opacity-100 size-7 bg-zinc-300! text-zinc-700!"
          onClick={() => setOpenMermaidInputDialog(true)}
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

      <MermaidInputDialog
        value={node.textContent}
        isOpen={openMermaidInputDialog}
        onOpenChange={setOpenMermaidInputDialog}
        onInsert={(code) => {
          const pos = getPos();
          if (pos === undefined) {
            return;
          }
          editor
            .chain()
            .focus()
            .setNodeSelection(pos)
            .updateMermaid({ code })
            .run();
          setOpenMermaidInputDialog(false);
        }}
      />
    </NodeViewWrapper>
  );
}
