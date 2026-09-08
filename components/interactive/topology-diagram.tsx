"use client";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Card } from "@/components/ui/card";

const initialNodes: Node[] = [
  { id: "core", type: "input", data: { label: "Core Router" }, position: { x: 250, y: 0 } },
  { id: "edge1", data: { label: "Edge Router A" }, position: { x: 100, y: 150 } },
  { id: "edge2", data: { label: "Edge Router B" }, position: { x: 400, y: 150 } },
  { id: "ixp", data: { label: "IXP Peering" }, position: { x: 250, y: 300 } },
];

const initialEdges: Edge[] = [
  { id: "e1", source: "core", target: "edge1", animated: true },
  { id: "e2", source: "core", target: "edge2", animated: true },
  { id: "e3", source: "edge1", target: "ixp", animated: true },
  { id: "e4", source: "edge2", target: "ixp", animated: true },
];

export default function TopologyDiagram() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <Card className="p-0 overflow-hidden">
      <div className="h-80 w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="#e2e8f0" gap={16} />
          <Controls />
          <MiniMap nodeColor="#0891b2" maskColor="rgba(255,255,255,0.8)" />
        </ReactFlow>
      </div>
    </Card>
  );
}
