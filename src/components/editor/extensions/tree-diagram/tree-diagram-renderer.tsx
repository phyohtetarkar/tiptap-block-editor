import { Alert } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { hierarchy, tree } from "d3-hierarchy";
import { useEffect, useMemo, useState } from "react";
import {
  ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";

export interface TreeNode {
  name: string;
  children?: TreeNode[];
}

const NODE_WIDTH = 200;
const NODE_HEIGHT = 100;

const CARD_WIDTH = 180;
const CARD_HEIGHT = 100;

export function TreeDiagramRenderer({ treeData }: { treeData: string }) {
  const [panZoomRef, setPanZoomRef] = useState<ReactZoomPanPinchRef | null>(
    null,
  );

  const root = useMemo(() => {
    try {
      const data = JSON.parse(treeData) as TreeNode;

      const root = hierarchy(data);

      const layout = tree<TreeNode>()
        .nodeSize([NODE_WIDTH, NODE_HEIGHT])
        .separation(() => 1);
      return layout(root);
    } catch (error) {
      console.error(error);
    }

    return null;
  }, [treeData]);

  useEffect(() => {
    panZoomRef?.centerView(1);
  }, [root, panZoomRef]);

  if (!root) {
    return <Alert variant="destructive">Invalid tree data</Alert>;
  }

  const nodes = root.descendants();

  const minX = Math.min(...nodes.map((n) => n.x - NODE_WIDTH / 2));
  const maxX = Math.max(...nodes.map((n) => n.x + NODE_WIDTH / 2));
  const minY = Math.min(...nodes.map((n) => n.y));
  const maxY = Math.max(...nodes.map((n) => n.y + CARD_HEIGHT));

  const treeWidth = maxX - minX;
  const treeHeight = maxY - minY;

  const offsetX = -minX;
  // const offsetY = -minY;

  return (
    <div className="aspect-video">
      <TransformWrapper
        onInit={setPanZoomRef}
        minScale={0.5}
        maxScale={3}
        centerOnInit={true}
      >
        <TransformComponent wrapperClass="size-full!">
          <div
            className="relative"
            style={{
              width: treeWidth,
              height: treeHeight,
            }}
          >
            <svg
              className="absolute overflow-visible"
              style={{
                left: offsetX,
              }}
            >
              {root.links().map((link, i) => {
                const x1 = link.source.x - (NODE_WIDTH - CARD_WIDTH) / 2;
                const y1 = link.source.y + CARD_HEIGHT / 2;

                const x2 = link.target.x - (NODE_WIDTH - CARD_WIDTH) / 2;
                const y2 = link.target.y;

                const mid = (y1 + y2) / 2;

                return (
                  <path
                    key={i}
                    d={`
                          M ${x1} ${y1}
                          L ${x1} ${mid}
                          L ${x2} ${mid}
                          L ${x2} ${y2}
                      `}
                    fill="none"
                    className="stroke-neutral-300 dark:stroke-neutral-600"
                  />
                );
              })}
            </svg>
            <div
              className="absolute"
              style={{
                left: offsetX,
              }}
            >
              {root.descendants().map((node, i) => {
                return (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      left: node.x - NODE_WIDTH / 2,
                      top: node.y,
                    }}
                  >
                    <Card
                      size="sm"
                      style={{
                        width: CARD_WIDTH,
                      }}
                    >
                      <CardContent>
                        <div className="text-center">{node.data.name}</div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
