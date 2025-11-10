import { useEffect, useRef, useState } from "react";
import { Textarea } from "./textarea";
import { cn } from "@/lib/utils";

const CodeTextarea = ({
  value,
  height,
  onChange,
  className,
}: {
  value: string;
  height: number | string;
  onChange?: (value: string) => void;
  className?: string;
}) => {
  const lineContainerRef = useRef<HTMLDivElement | null>(null);
  const [code, setCode] = useState(value);
  const [lineCount, setLineCount] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  const [scrollbarOffset, setScrollbarOffset] = useState(0);

  useEffect(() => {
    setLineCount(code.split("\n").length);
  }, [code]);

  return (
    <div className={cn("flex", className)}>
      <div
        ref={lineContainerRef}
        className={cn(
          "p-2 w-12 border border-e-0 rounded-s-me bg-accent rounded-s-md overflow-hidden",
          {
            "border-primary": inputFocused,
          }
        )}
        style={{
          paddingBottom: scrollbarOffset + 8,
          height: height,
        }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div
            key={i}
            className="text-end font-mono text-sm text-muted-foreground"
          >
            {i + 1}
          </div>
        ))}
      </div>
      <div
        className={cn("border-y", {
          "border-primary": inputFocused,
        })}
      >
        <div className="h-full w-[1px] bg-border"></div>
      </div>
      <Textarea
        id="mermaid-code"
        className="rounded-s-none border-s-0 resize-none"
        placeholder="Enter mermaid code"
        value={code}
        wrap="off"
        spellCheck="false"
        style={{
          height: height,
        }}
        onChange={(evt) => {
          setCode(evt.target.value);
          onChange?.(evt.target.value);
        }}
        onFocus={() => {
          setInputFocused(true);
        }}
        onBlur={() => {
          setInputFocused(false);
        }}
        onScroll={(evt) => {
          if (!lineContainerRef.current) {
            return;
          }

          const el = evt.currentTarget;

          lineContainerRef.current.scrollTop = el.scrollTop || 0;
          const hasScroll = el.scrollWidth > el.clientWidth;
          setScrollbarOffset(hasScroll ? el.offsetHeight - el.clientHeight : 0);
        }}
      />
    </div>
  );
};

export { CodeTextarea };
