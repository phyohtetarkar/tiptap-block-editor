import { createColGroup, Table } from "@tiptap/extension-table";
import { DOMOutputSpec } from "@tiptap/pm/model";
import { mergeAttributes } from "@tiptap/react";

export const CustomTable = Table.extend({
  renderHTML({ node, HTMLAttributes }) {
    const { colgroup, tableWidth, tableMinWidth } = createColGroup(
      node,
      this.options.cellMinWidth
    );

    const table: DOMOutputSpec = [
      "div",
      {
        class: "table-wrapper overflow-y-auto my-[1em] not-draggable",
      },
      [
        "table",
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
          style: tableWidth
            ? `width: ${tableWidth}`
            : `minWidth: ${tableMinWidth}`,
        }),
        colgroup,
        ["tbody", 0],
      ],
    ];

    return table;
  },
});
