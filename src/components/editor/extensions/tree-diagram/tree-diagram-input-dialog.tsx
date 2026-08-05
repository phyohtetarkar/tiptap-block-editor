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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { useState } from "react";
import z from "zod";
import { TreeNode } from "./tree-diagram-renderer";

const TreeNodeSchema: z.ZodType<TreeNode> = z.lazy(() =>
  z.object({
    name: z.string(),
    children: z.array(TreeNodeSchema).optional(),
  }),
);

const expandJson = (value?: string) => {
  if (!value) {
    return "";
  }

  try {
    const json = JSON.parse(value);
    const expanded = JSON.stringify(json, null, 2);
    return expanded;
  } catch (e) {
    console.error(e);
  }

  return "";
};

export function TreeDiagramInputDialog({
  value,
  isOpen,
  onOpenChange,
  onInsert,
}: {
  value?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert?: (value: string) => void;
}) {
  const [data, setData] = useState(expandJson(value));
  const [error, setError] = useState<string>();

  const handleSubmit = () => {
    try {
      setError(undefined);
      const json = JSON.parse(data);
      const result = TreeNodeSchema.safeParse(json);

      if (!result.success) {
        // const msg = result.error.issues.map((is) => is.message).join(", ");
        throw Error("Invalid JSON structure");
      }

      onInsert?.(JSON.stringify(result.data));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const placeholder = `
Enter your tree structure JSON here...

Example:
{
  "name": "Root",
  "children": [
    {
      "name": "Child 1",
      "children": [
        {
          "name": "Grandchild 1"
        }
      ]
    }
  ]
}
  `.trim();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={(op) => {
        if (op) {
          setData(expandJson(value));
          setError(undefined);
        }
      }}
      disablePointerDismissal
    >
      <DialogContent aria-describedby={undefined} className="p-0 sm:max-w-2xl">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle>Insert tree diagram</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 max-h-[50vh] overflow-y-auto px-5 py-2">
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor="tree-data">Tree data</FieldLabel>
            <CodeTextarea
              id="tree-data"
              value={data}
              onChange={setData}
              height={300}
              placeholder={placeholder}
            />
            <FieldError>{error}</FieldError>
          </Field>
        </div>
        <DialogFooter className="p-5 pt-0">
          <DialogClose
            render={<Button variant="secondary">Cancel</Button>}
          ></DialogClose>
          <Button disabled={data.trim().length === 0} onClick={handleSubmit}>
            {value ? "Update" : "Insert"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
