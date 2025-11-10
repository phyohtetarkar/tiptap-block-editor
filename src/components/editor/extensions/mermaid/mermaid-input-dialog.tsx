import { Button } from "@/components/ui/button";
import { CodeTextarea } from "@/components/ui/code-textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import mermaid from "mermaid";
import { useEffect, useState } from "react";

export function MermaidInputDialog({
  value,
  isOpen,
  onOpenChange,
  onInsert,
}: {
  value?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert?: (code: string) => void;
}) {
  const [code, setCode] = useState(value ?? "");
  const [error, setError] = useState<string>();

  const handleSubmit = async () => {
    setError(undefined);
    try {
      await mermaid.parse(code);
      onInsert?.(code);
    } catch (error: any) {
      setError(error.message);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCode(value ?? "");
      setError(undefined);
    }
  }, [isOpen, value]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        onInteractOutside={(evt) => evt.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Insert mermaid diagram</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1">
          <div className="flex flex-col py-2">
            <Label htmlFor="mermaid-code" className="mb-2">
              Code
            </Label>
            <CodeTextarea value={code} onChange={setCode} height={300} />
            {error && (
              <div className="text-sm text-destructive mt-1.5">{error}</div>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button disabled={code.trim().length === 0} onClick={handleSubmit}>
            {value ? "Update" : "Insert"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
