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
import { useState } from "react";

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
    try {
      setError(undefined);
      await mermaid.parse(code);
      onInsert?.(code);
    } catch (e: any) {
      setError(e.message);
    }
  };

  // useEffect(() => {
  //   if (isOpen) {
  //     setCode(value ?? "");
  //     setError(undefined);
  //   }
  // }, [isOpen, value]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={(op) => {
        if (op) {
          setCode(value ?? "");
          setError(undefined);
        }
      }}
      disablePointerDismissal
    >
      <DialogContent aria-describedby={undefined} className="p-0 sm:max-w-2xl">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle>Insert mermaid diagram</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 max-h-[50vh] overflow-y-auto px-5 py-2">
          <div className="flex flex-col py-2">
            <Label htmlFor="mermaid-code" className="mb-2">
              Code
            </Label>
            <CodeTextarea
              id="mermaid-code"
              value={code}
              onChange={setCode}
              height={300}
              placeholder="Enter mermaid code"
            />
            {error && (
              <div className="text-sm text-destructive mt-1.5">{error}</div>
            )}
          </div>
        </div>
        <DialogFooter className="p-5 pt-0">
          <DialogClose
            render={<Button variant="secondary">Cancel</Button>}
          ></DialogClose>
          <Button disabled={code.trim().length === 0} onClick={handleSubmit}>
            {value ? "Update" : "Insert"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
