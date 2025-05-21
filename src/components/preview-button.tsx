import { Editor } from "@tiptap/core";
import { useState } from "react";
import { ContentRenderer } from "./editor";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export default function PreviewButton({ editor }: { editor?: Editor }) {
  const [open, setOpen] = useState(false);
  const [html, setHtml] = useState<string>();

  return (
    <Dialog
      open={open}
      onOpenChange={(op) => {
        setOpen(op);
        if (op) {
          setHtml(editor?.getHTML());
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>Preview</Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-4xl p-0"
        onInteractOutside={(evt) => evt.preventDefault()}
        aria-describedby={undefined}
      >
        <DialogHeader className="p-5 pb-0">
          <DialogTitle>Preview</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] p-5 overflow-y-auto">
          <ContentRenderer html={html} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
