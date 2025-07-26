import { BounceSpinner } from "@/components/ui/bounce-spinner";
import { NodeViewProps } from "@tiptap/core";
import { NodeViewWrapper, useEditorState } from "@tiptap/react";
import Markdown from "react-markdown";

const AiPlaceholderView = ({ editor }: NodeViewProps) => {
  const { completion } = useEditorState({
    editor: editor,
    selector: (instance) => {
      const storage = instance.editor.storage.ai;
      return {
        completion: storage.message,
      };
    },
  });

  return (
    <NodeViewWrapper>
      <div className="flex flex-wrap items-baseline">
        <div>
          <Markdown>{completion}</Markdown>
        </div>
        <BounceSpinner className="ms-2" />
      </div>
    </NodeViewWrapper>
  );
};

export default AiPlaceholderView;
