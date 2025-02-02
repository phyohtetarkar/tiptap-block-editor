"use client";
import { cn } from "@/lib/utils";
import type { HLJSPlugin } from "highlight.js";
import hljs from "highlight.js/lib/common";
import katex from "katex";
import { useEffect, useState } from "react";

const hljsCopyButtonPlugin: HLJSPlugin = {
  "after:highlightElement"({ el, text }) {
    const pre = el.parentElement;

    if (!pre) {
      return;
    }

    let wrapper = pre.parentElement;
    if (!wrapper?.hasAttribute("data-code-wrapper")) {
      wrapper = document.createElement("div");
      wrapper.className = cn("relative");
      wrapper.setAttribute("data-code-wrapper", "");
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
    }

    const copyButton = document.createElement("button");
    copyButton.className = cn(
      "absolute text-sm rounded bg-gray-800/50 text-white/70 hover:text-white border border-white/70 hover:border-white top-3 end-3 px-2 py-0.5"
    );
    copyButton.textContent = "Copy";

    copyButton.onclick = () => {
      navigator.clipboard.writeText(text).then(() => {
        copyButton.textContent = "Copied!";
        setTimeout(() => {
          copyButton.textContent = "Copy";
        }, 2000);
      });
    };

    const b = wrapper.querySelector("button");
    if (b) {
      wrapper.removeChild(b);
    }

    wrapper.appendChild(copyButton);
  },
};

const ContentRenderer = ({ html }: { html?: string }) => {
  const [element, setElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!element) {
      return;
    }

    hljs.addPlugin(hljsCopyButtonPlugin);

    element.querySelectorAll("pre code").forEach((el) => {
      // then highlight each
      hljs.highlightElement(el as any);
    });

    element.querySelectorAll('[data-type="math"]').forEach((el) => {
      const latex = el.getAttribute("latex");
      if (!latex) {
        return;
      }
      el.innerHTML = katex.renderToString(latex, {
        throwOnError: false,
      });
    });
  }, [element]);

  return (
    <article
      ref={setElement}
      className="tiptap prose dark:prose-invert focus:outline-none max-w-full"
      dangerouslySetInnerHTML={{ __html: html ?? "" }}
    />
  );
};

export { ContentRenderer };
