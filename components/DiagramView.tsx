
import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap, BackgroundVariant } from 'reactflow';
import type { Node, Edge, OnNodesChange, OnEdgesChange, Connection, NodeTypes } from 'reactflow';
import CustomNode from './CustomNode'; // Import the custom node

interface DiagramViewProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
}

const DiagramView: React.FC<DiagramViewProps> = ({ nodes, edges, onNodesChange, onEdgesChange, onConnect }) => {
  // Define nodeTypes to include CustomNode
  // useMemo is used to prevent re-creation of this object on every render unless CustomNode itself changes
  const nodeTypes: NodeTypes = useMemo(() => ({ 
    custom: CustomNode,
    // You can add other custom node types here if needed
  }), []);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden bg-slate-700">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition="bottom-left"
        nodesDraggable={true}
        nodesConnectable={true}
        className="bg-slate-700"
        proOptions={{ hideAttribution: true }}
        nodeTypes={nodeTypes} // Pass the custom node types
      >
        <Background variant={BackgroundVariant.Dots} gap={18} size={0.8} color="#475569" />
        <Controls className="text-slate-300 react-flow__controls" />
        <MiniMap 
          nodeStrokeColor={(n) => {
            if (n.style?.borderColor) return n.style.borderColor as string;
            if (n.type === 'input') return '#10b981';
            if (n.type === 'output') return '#f59e0b';
            if (n.type === 'custom') return '#38bdf8'; // Default for custom nodes
            return '#38bdf8';
          }} 
          nodeColor={(n) => {
            if (n.style?.background) return n.style.background as string;
            if (n.type === 'custom') return '#0f172a'; // Default for custom nodes
            return '#0f172a';
          }}
          nodeBorderRadius={3}
          className="bg-slate-800 border border-slate-600 shadow-xl"
          maskColor="rgba(20, 29, 47, 0.7)"
        />
      </ReactFlow>
    </div>
  );
};

export default DiagramView;
