
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { CustomNodeData } from '../types'; // Ensure this type is correctly defined

// A simple map for placeholder icons. Replace with actual SVG icons later.
const iconPlaceholders: { [key: string]: string } = {
  user: '👤',
  database: '💾',
  settings: '⚙️',
  document: '📄',
  time: '⏰',
  idea: '💡',
  process: '🔄',
  warning: '⚠️',
  code: '💻',
  server: '🖥️', // Using a desktop as a generic server icon
  cloud: '☁️',
  check: '✔️',
  error: '❌',
  gear: '⚙️', // Same as settings
  lightbulb: '💡', // Same as idea
  folder: '📁',
  message: '✉️',
  chart: '📊',
  payment: '💳',
  security: '🛡️',
  play: '▶️',
  flag: '🚩',
  default: '🧩', // Default puzzle piece
};


const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({ data, sourcePosition = Position.Bottom, targetPosition = Position.Top }) => {
  const { label, iconKeyword } = data;
  const iconDisplay = iconKeyword ? iconPlaceholders[iconKeyword.toLowerCase()] || iconPlaceholders['default'] : null;

  return (
    <div
      className="bg-slate-800 border-2 border-sky-500 rounded-lg shadow-xl text-slate-100 p-3 min-w-[150px] max-w-[250px] text-center"
      style={{
        padding: '10px 20px',
        fontSize: '12px',
      }}
    >
      <Handle type="target" position={targetPosition} className="!bg-teal-500 w-3 h-3" />
      
      {iconDisplay && (
        <div className="text-2xl mb-1" aria-hidden="true">{iconDisplay}</div>
      )}
      
      <div className="text-sm font-medium break-words">
        {label || 'Unnamed Node'}
      </div>
      
      <Handle type="source" position={sourcePosition} className="!bg-pink-500 w-3 h-3" />
    </div>
  );
};

export default memo(CustomNode);
