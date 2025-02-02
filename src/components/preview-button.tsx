import { Editor } from "@tiptap/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { ContentRenderer } from "./editor";
import { useState } from "react";
import { ScrollArea } from "./ui/scroll-area";

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
        className="max-w-4xl"
        onInteractOutside={(evt) => evt.preventDefault()}
        aria-describedby={undefined}
      >
        <DialogHeader className="mb-4">
          <DialogTitle>Preview</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <ContentRenderer html={html} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
