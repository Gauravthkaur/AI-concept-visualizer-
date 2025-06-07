
import React from 'react';
import { DiagramModule, DiagramStyle, AllDiagramType, SimpleDiagramType, GenerationMode } from '../types';
import Button from './Button';
import { DEFAULT_PROMPT_TEXT, DEFAULT_PROMPT_MERMAID, DEFAULT_PROMPT_CODE, AVAILABLE_DIAGRAM_TYPES } from '../constants';


interface InputAreaProps {
  module: DiagramModule;
  diagramStyle?: DiagramStyle; 
  selectedDiagramType?: AllDiagramType;
  inputText: string;
  onInputChange: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  onClear: () => void;
  generationMode: GenerationMode;
}

const InputArea: React.FC<InputAreaProps> = ({
  module,
  diagramStyle,
  selectedDiagramType,
  inputText,
  onInputChange,
  onGenerate,
  isLoading,
  onClear,
  generationMode,
}) => {
  const getPlaceholderText = () => {
    if (generationMode === GenerationMode.SMART) {
      return `Enter your ${module === DiagramModule.CODE ? 'code snippet' : 'text description'} here. The AI will analyze it, choose the best diagram type, and generate it with icons and simplified content!`;
    }
    if (module === DiagramModule.CODE) {
      return "Paste your code snippet here (e.g., a JavaScript function)... The AI will attempt to generate a Control Flow Graph.";
    }
    if (selectedDiagramType === SimpleDiagramType.MERMAID_MIND_MAP) {
      return "Enter text to generate a Mermaid Mind Map (e.g., project outline, book chapters...). The AI will create renderable Mermaid syntax and a summary.";
    }
    // For other interactive diagrams
    const diagramTypeInfo = selectedDiagramType ? AVAILABLE_DIAGRAM_TYPES[selectedDiagramType as keyof typeof AVAILABLE_DIAGRAM_TYPES] : null;
    let placeholder = "Enter your text description here ";
    if (diagramTypeInfo) {
      placeholder += `for a ${selectedDiagramType} (e.g., ${diagramTypeInfo.description.split('(Interactive)')[0].toLowerCase().trim()}). `;
    } else {
      placeholder += `for an interactive diagram. `;
    }
    placeholder += "The AI will simplify the content and add icons where appropriate.";

    return placeholder;
  };

  const getGenerateButtonText = () => {
    if (isLoading) {
      return (
        <>
          <svg aria-hidden="true" className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating...
        </>
      );
    }
    if (generationMode === GenerationMode.SMART) {
      return 'Generate Smart Diagram';
    }
    if (module === DiagramModule.CODE) {
      return 'Generate Code Diagram';
    }
    if (selectedDiagramType === SimpleDiagramType.MERMAID_MIND_MAP) {
      return 'Generate Mermaid Mind Map & Summary';
    }
    return `Generate ${diagramStyle || ''} ${selectedDiagramType || 'Diagram'}`.trim();
  };
  
  const getInputLabel = () => {
    if (generationMode === GenerationMode.SMART) {
        return `Enter ${module === DiagramModule.CODE ? 'Your Code' : 'Text'} for Smart AI Diagramming`;
    }
    let labelPrefix = "Enter ";
    if (module === DiagramModule.CODE) return labelPrefix + 'Your Code for Control Flow Graph';
    if (selectedDiagramType === SimpleDiagramType.MERMAID_MIND_MAP) return labelPrefix + 'Text for Mermaid Mind Map';
    
    const diagramTypeInfo = selectedDiagramType ? AVAILABLE_DIAGRAM_TYPES[selectedDiagramType as keyof typeof AVAILABLE_DIAGRAM_TYPES] : null;
    let diagramName = selectedDiagramType || 'Diagram';
    if (diagramTypeInfo) {
        diagramName = selectedDiagramType as string;
    }
    return `${labelPrefix}${diagramStyle ? diagramStyle + ' ' : ''}Text for ${diagramName}`.trim();
  }


  return (
    <div className="space-y-4 p-4 bg-slate-700 rounded-lg shadow-lg border border-slate-600">
      <label htmlFor="input-textarea" className="block text-md font-semibold text-sky-300">
        {getInputLabel()}
      </label>
      <textarea
        id="input-textarea"
        value={inputText}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder={getPlaceholderText()}
        rows={module === DiagramModule.TEXT ? 8 : 10}
        className="w-full p-3 bg-slate-800 border border-slate-500 rounded-md focus:ring-2 focus:ring-sky-400 focus:border-sky-400 text-slate-100 placeholder-slate-500 resize-y custom-scrollbar text-sm"
        style={{fontFamily: module === DiagramModule.CODE ? 'monospace' : 'inherit'}}
        aria-label={module === DiagramModule.TEXT ? 'Text input for diagram generation' : 'Code input for diagram generation'}
      />
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
        <Button onClick={onGenerate} disabled={isLoading || !inputText.trim()} variant="primary" className="flex-grow text-sm py-2.5">
          {getGenerateButtonText()}
        </Button>
        <Button onClick={onClear} variant="secondary" disabled={isLoading} className="text-sm py-2.5">
          Clear Input & Diagram
        </Button>
      </div>
    </div>
  );
};

export default InputArea;
