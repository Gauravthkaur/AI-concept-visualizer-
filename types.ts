
import type { Node as RFNode, Edge as RFEdge } from 'reactflow';

export enum DiagramModule {
  TEXT = 'Text-to-Diagram',
  CODE = 'Code-to-Diagram',
}

export enum DiagramStyle {
  STANDARD = 'Standard',
  SIMPLE = 'Simple',
}

export enum GeneralDiagramType {
  FLOWCHART = 'Flowchart',
  MIND_MAP = 'Mind Map',
  // CONCEPT_MAP = 'Concept Map',
  // TIMELINE = 'Timeline',
  // PROCESS = 'Process Diagram',
}

export enum CodeDiagramType {
  CONTROL_FLOW_GRAPH = 'Control Flow Graph',
  // SEQUENCE_DIAGRAM = 'Sequence Diagram',
  // FUNCTION_CALL_GRAPH = 'Function Call Graph',
}

export enum SimpleDiagramType {
  BASIC_LINEAR_FLOW = 'Basic Linear Flow',
  SIMPLE_CAUSE_EFFECT = 'Simple Cause & Effect',
  CONCEPT_LINK = 'Concept Link Diagram',
  KEYWORD_CLUSTER = 'Keyword Cluster',
  MERMAID_MIND_MAP = 'Mermaid Mind Map', 
}

export type AllDiagramType = GeneralDiagramType | CodeDiagramType | SimpleDiagramType;

// Extending React Flow's Node and Edge types for compatibility and custom data
export interface CustomNodeData {
  label: string;
  iconKeyword?: string; // To suggest an icon for the node
  // any other custom data properties
}

export type Node<T = CustomNodeData> = RFNode<T>;
export type Edge<T = any> = RFEdge<T>;

export interface DiagramData {
  nodes: Node[];
  edges: Edge[];
  explanation?: string; // Added for AI-generated explanation
}

export interface MermaidDiagramData {
  mermaidSyntax: string;
  explanation?: string; // Added for AI-generated explanation
}

export enum GenerationMode {
  MANUAL = 'Manual Selection',
  SMART = 'Smart AI Selection',
}

export interface SmartDiagramResponse {
  suggestedDiagramType: AllDiagramType;
  diagramData?: DiagramData; 
  mermaidSyntax?: string; 
  explanation?: string; // Added for AI-generated explanation
}
