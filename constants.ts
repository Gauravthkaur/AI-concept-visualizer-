
import { GeneralDiagramType, CodeDiagramType, SimpleDiagramType, DiagramModule } from './types';

export const AVAILABLE_DIAGRAM_TYPES = {
  [GeneralDiagramType.FLOWCHART]: {
    module: DiagramModule.TEXT,
    description: 'Visualize processes and decision trees (Interactive).',
  },
  [GeneralDiagramType.MIND_MAP]: {
    module: DiagramModule.TEXT,
    description: 'Organize ideas and brainstorm (Interactive).',
  },
  [CodeDiagramType.CONTROL_FLOW_GRAPH]: {
    module: DiagramModule.CODE,
    description: 'Visualize code execution paths (Interactive).',
  },
  [SimpleDiagramType.BASIC_LINEAR_FLOW]: {
    module: DiagramModule.TEXT,
    description: 'Show a simple sequence of steps (Interactive).',
  },
  [SimpleDiagramType.SIMPLE_CAUSE_EFFECT]: {
    module: DiagramModule.TEXT,
    description: 'Illustrate a direct cause and its effect (Interactive).',
  },
  [SimpleDiagramType.CONCEPT_LINK]: {
    module: DiagramModule.TEXT,
    description: 'Connect two concepts with a simple relationship (Interactive).',
  },
  [SimpleDiagramType.KEYWORD_CLUSTER]: {
    module: DiagramModule.TEXT,
    description: 'A central keyword with related terms radiating outwards (Interactive).',
  },
  [SimpleDiagramType.MERMAID_MIND_MAP]: { // Key updated to match renamed enum
    module: DiagramModule.TEXT,
    description: 'Generates a Mermaid.js mind map from text with an AI summary. Renders dynamically.',
  },
};

export const DEFAULT_PROMPT_TEXT = 'Describe a simple login process: user enters credentials, system validates. If valid, redirect to dashboard. If invalid, show error message.';
export const DEFAULT_PROMPT_MERMAID = "Create a mind map about the key benefits of learning a new language: Personal Growth (Cultural Understanding, New Perspectives), Career Opportunities (Global Market, Higher Salary), Travel (Easier Communication, Deeper Experiences), Cognitive Benefits (Improved Memory, Problem Solving).";
export const DEFAULT_PROMPT_CODE = 
`function factorial(n) {
  if (n === 0) {
    return 1;
  } else {
    return n * factorial(n - 1);
  }
}`;

export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';
export const GEMINI_MODEL_CODE = 'gemini-2.5-flash-preview-04-17';
// GEMINI_MODEL_IMAGE is no longer used for MERMAID_MIND_MAP
// export const GEMINI_MODEL_IMAGE = 'imagen-3.0-generate-002';
