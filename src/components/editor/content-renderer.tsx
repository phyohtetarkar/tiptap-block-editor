import { cn } from "@/lib/utils";
import type { HLJSPlugin } from "highlight.js";
import hljs from "highlight.js/lib/common";
import katex from "katex";
import mermaid from "mermaid";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChartData, ChartRenderer, parseChartData } from "./extensions/chart";

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

const ChartComponents = ({ root }: { root: HTMLElement | null }) => {
  const [chartNodes, setChartNodes] = useState<
    { element: Element; data: ChartData }[]
  >([]);

  useEffect(() => {
    if (!root) {
      return;
    }

    const elements = Array.from(root.querySelectorAll(".chart"));

    const list: typeof chartNodes = [];

    for (const element of elements) {
      const value = element.textContent;
      if (!value) {
        continue;
      }

      const parsed = JSON.parse(value);
      const result = parseChartData(parsed);
      if (!result.success) {
        continue;
      }

      element.textContent = "";
      element.removeAttribute("data-processed");
      element.setAttribute("data-processed", "true");

      list.push({ element, data: result.data });
    }

    setChartNodes(list);
  }, [root]);

  if (!root) {
    return null;
  }

  return chartNodes.map(({ data, element }, i) => {
    return createPortal(<ChartRenderer chartData={data} />, element, i);
  });
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

    element.querySelectorAll('[data-content-type="math"]').forEach((el) => {
      const latex = el.textContent;
      if (!latex) {
        return;
      }
      el.innerHTML = katex.renderToString(latex, {
        throwOnError: false,
      });
    });

    mermaid.run({
      nodes: element.querySelectorAll(".mermaid"),
      suppressErrors: true,
    });
  }, [element]);

  return (
    <>
      <article
        ref={setElement}
        className="tiptap prose dark:prose-invert focus:outline-none max-w-full"
        dangerouslySetInnerHTML={{ __html: html ?? "" }}
      />

      <ChartComponents root={element} />
    </>
  );
};

export { ContentRenderer };
