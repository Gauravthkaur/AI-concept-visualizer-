
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ReactFlowProvider, useNodesState, useEdgesState, applyNodeChanges, applyEdgeChanges, Position, MarkerType } from 'reactflow';
import type { OnNodesChange, OnEdgesChange, Connection, Edge } from 'reactflow';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DiagramView from './components/DiagramView';
import InputArea from './components/InputArea';
import LoadingSpinner from './components/LoadingSpinner';
import MermaidDiagramRenderer from './components/MermaidDiagramRenderer';
import Button from './components/Button';
import { 
  DiagramModule, GeneralDiagramType, CodeDiagramType, AllDiagramType, DiagramData, Node, 
  DiagramStyle, SimpleDiagramType, MermaidDiagramData, GenerationMode, SmartDiagramResponse, CustomNodeData 
} from './types';
import { generateDiagramData, generateMermaidMindMapAndSummary, generateSmartDiagramWithJustification } from './services/geminiService';
import { DEFAULT_PROMPT_TEXT, DEFAULT_PROMPT_CODE, DEFAULT_PROMPT_MERMAID, AVAILABLE_DIAGRAM_TYPES } from './constants';

// Ensure mermaid is globally available
declare const mermaid: any;

const initialNodes: Node<CustomNodeData>[] = [
  { id: '1', type: 'custom', data: { label: 'Welcome to IntelliGraph!', iconKeyword: 'play' }, position: { x: 50, y: 50 }, },
  { id: '2', type: 'custom', data: { label: 'Select a mode, style, and diagram type, or try Smart AI Selection!' }, position: { x: 50, y: 150 }, },
  { id: '3', type: 'custom', data: { label: 'Enter text/code and click "Generate". Ensure API_KEY is configured.', iconKeyword: 'gear' }, position: { x: 50, y: 250 }, },
];
const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e2-3', source: '2', target: '3', markerEnd: { type: MarkerType.ArrowClosed } },
];


const App: React.FC = () => {
  const [generationMode, setGenerationMode] = useState<GenerationMode>(GenerationMode.MANUAL);
  const [activeModule, setActiveModule] = useState<DiagramModule>(DiagramModule.TEXT);
  const [diagramStyle, setDiagramStyle] = useState<DiagramStyle>(DiagramStyle.SIMPLE);
  const [selectedDiagramType, setSelectedDiagramType] = useState<AllDiagramType>(SimpleDiagramType.MERMAID_MIND_MAP);
  const [inputText, setInputText] = useState<string>(DEFAULT_PROMPT_MERMAID);
  const [inputCode, setInputCode] = useState<string>(DEFAULT_PROMPT_CODE);
  
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState<CustomNodeData>(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);

  const [mermaidSyntax, setMermaidSyntax] = useState<string | null>(null);
  const [diagramExplanation, setDiagramExplanation] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  
  const diagramOutputRef = useRef<HTMLDivElement>(null);
  const explanationRef = useRef<HTMLDivElement>(null); 

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => [...eds, { ...connection, id: `e${connection.source}-${connection.target}-${Math.random()}`, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#38bdf8' } } as Edge]),
    [setEdges]
  );

  const resetDiagramArea = () => {
    setNodes(initialNodes.map(n => ({...n, type: 'custom' }))); 
    setEdges(initialEdges);
    setMermaidSyntax(null);
    setDiagramExplanation(null);
    setError(null);
  }

  const resetInputsAndDiagram = () => {
    resetDiagramArea();
    const currentPromptKey = selectedDiagramType as keyof typeof AVAILABLE_DIAGRAM_TYPES;
    const diagramTypeDef = AVAILABLE_DIAGRAM_TYPES[currentPromptKey];

    if (activeModule === DiagramModule.TEXT) {
        if (selectedDiagramType === SimpleDiagramType.MERMAID_MIND_MAP) {
            setInputText(DEFAULT_PROMPT_MERMAID);
        } else if (diagramTypeDef && diagramTypeDef.module === DiagramModule.TEXT) {
             setInputText(DEFAULT_PROMPT_TEXT); 
        } else {
             setInputText(DEFAULT_PROMPT_TEXT);
        }
    } else {
        setInputCode(DEFAULT_PROMPT_CODE);
    }
  };
  
  useEffect(() => {
    if (generationMode === GenerationMode.MANUAL) {
      resetInputsAndDiagram();
    }
  }, [selectedDiagramType, activeModule, diagramStyle, generationMode]);


  const handleActiveModuleChange = (newModule: DiagramModule) => {
    setActiveModule(newModule);
    if (generationMode === GenerationMode.MANUAL) {
      if (newModule === DiagramModule.TEXT) {
        setDiagramStyle(DiagramStyle.SIMPLE); 
        setSelectedDiagramType(SimpleDiagramType.MERMAID_MIND_MAP);
      } else {
        setSelectedDiagramType(CodeDiagramType.CONTROL_FLOW_GRAPH);
      }
    }
    if (newModule === DiagramModule.CODE) {
        setInputText(DEFAULT_PROMPT_CODE); 
    } else {
        setInputText(DEFAULT_PROMPT_MERMAID);
    }
    resetDiagramArea();
  };

  const handleDiagramStyleChange = (newStyle: DiagramStyle) => {
    setDiagramStyle(newStyle);
     if (generationMode === GenerationMode.MANUAL && activeModule === DiagramModule.TEXT) {
        if (newStyle === DiagramStyle.STANDARD) {
            setSelectedDiagramType(GeneralDiagramType.FLOWCHART);
        } else { 
            setSelectedDiagramType(SimpleDiagramType.MERMAID_MIND_MAP);
        }
    }
  };
  
  const handleDiagramTypeChange = (newType: AllDiagramType) => {
    setSelectedDiagramType(newType);
  };

  const handleGenerationModeChange = (newMode: GenerationMode) => {
    setGenerationMode(newMode);
    resetInputsAndDiagram(); 
    if (newMode === GenerationMode.SMART) {
        // AI will select the best diagram type
    } else {
        if (activeModule === DiagramModule.TEXT) {
            setSelectedDiagramType(SimpleDiagramType.MERMAID_MIND_MAP);
            setDiagramStyle(DiagramStyle.SIMPLE);
        } else {
            setSelectedDiagramType(CodeDiagramType.CONTROL_FLOW_GRAPH);
        }
    }
  };


  const handleGenerateDiagram = async () => {
    setIsLoading(true);
    setError(null);
    setMermaidSyntax(null); 
    setDiagramExplanation(null);
    setNodes([]); 
    setEdges([]);

    const currentInput = activeModule === DiagramModule.TEXT ? inputText : inputCode;

    if (!currentInput.trim()) {
      setError('Input cannot be empty.');
      setIsLoading(false);
      return;
    }
    
    try {
      if (generationMode === GenerationMode.SMART) {
        const smartResponse: SmartDiagramResponse = await generateSmartDiagramWithJustification(currentInput, activeModule);
        
        setSelectedDiagramType(smartResponse.suggestedDiagramType); 
        setDiagramExplanation(smartResponse.explanation || null);

        if (smartResponse.mermaidSyntax) {
          setMermaidSyntax(smartResponse.mermaidSyntax);
        } else if (smartResponse.diagramData) {
          if (smartResponse.diagramData.nodes.length === 0 && !error) {
            setError('AI selected an interactive diagram type but could not generate nodes. Try rephrasing or a different input.');
             resetDiagramArea();
          } else {
            setNodes(smartResponse.diagramData.nodes.map(n => ({
                ...n, 
                type: 'custom',
            })));
            setEdges(smartResponse.diagramData.edges.map(e => ({...e, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#38bdf8' } })));
          }
        } else {
           setError(`AI selected ${smartResponse.suggestedDiagramType} but returned no diagram data.`);
           resetDiagramArea();
        }

      } else { // Manual Mode
        if (activeModule === DiagramModule.TEXT && selectedDiagramType === SimpleDiagramType.MERMAID_MIND_MAP) {
          const mermaidData = await generateMermaidMindMapAndSummary(currentInput);
          setMermaidSyntax(mermaidData.mermaidSyntax);
          setDiagramExplanation(mermaidData.explanation || null);
        } else {
          const diagramData: DiagramData = await generateDiagramData(currentInput, selectedDiagramType, activeModule, diagramStyle);
          setDiagramExplanation(diagramData.explanation || null);
          if (diagramData.nodes.length === 0 && diagramData.edges.length === 0 && !error) { 
            setError('AI could not generate an interactive diagram. Try rephrasing your input or a different diagram type.');
            resetDiagramArea();
          } else {
            setNodes(diagramData.nodes.map(n => ({ 
                ...n, 
                type: 'custom', 
            })));
            setEdges(diagramData.edges.map(e => ({...e, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#38bdf8' } })));
          }
        }
      }
    } catch (err: any) {
      console.error("Error generating diagram in App.tsx:", err);
      let errorMessage = "Failed to generate. ";
      if (err.message && (err.message.toLowerCase().includes('api key') || err.message.toLowerCase().includes('permission'))) {
          errorMessage += "Please ensure your Gemini API Key (process.env.API_KEY) is correctly configured and has permissions.";
      } else if (err.message) {
          errorMessage += err.message;
      } else {
          errorMessage += "An unknown error occurred.";
      }
      setError(errorMessage);
      resetDiagramArea();
    } finally {
      setIsLoading(false);
    }
  };
  
  const currentInputText = activeModule === DiagramModule.TEXT ? inputText : inputCode;
  const setCurrentInputText = activeModule === DiagramModule.TEXT ? setInputText : setInputCode;

  const handleDownloadDiagram = async () => {
    if (!diagramOutputRef.current) {
      setError("Diagram container reference not found for PDF generation.");
      return;
    }
    
    setIsDownloading(true);
    setError(null);
    
    try {
      // Create a PDF document
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let currentY = margin;
      
      // Add title
      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.text('IntelliGraph - Diagram & Explanation', margin, currentY);
      currentY += 15;
      
      // Capture diagram image based on type
      let diagramImage: string;
      
      if (mermaidSyntax) {
        // For Mermaid diagrams
        diagramImage = await captureMermaidDiagram(mermaidSyntax);
      } else if (nodes.length > 0) {
        // For ReactFlow diagrams
        diagramImage = await captureReactFlowDiagram();
      } else {
        setError("No diagram content available to download as PDF.");
        setIsDownloading(false);
        return;
      }
      
      // Add diagram image to PDF
      const imgProps = doc.getImageProperties(diagramImage);
      const aspectRatio = imgProps.width / imgProps.height;
      let imgWidth = pageWidth - 2 * margin;
      let imgHeight = imgWidth / aspectRatio;
      const maxImgHeight = pageHeight * 0.55;
      
      if (imgHeight > maxImgHeight) {
        imgHeight = maxImgHeight;
        imgWidth = imgHeight * aspectRatio;
      }
      
      const imgX = (pageWidth - imgWidth) / 2;
      doc.addImage(diagramImage, 'PNG', imgX, currentY, imgWidth, imgHeight);
      currentY += imgHeight + 10;
      
      // Add explanation if available
      if (diagramExplanation) {
        if (currentY + 20 > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(50);
        doc.text('Explanation:', margin, currentY);
        currentY += 7;
        
        doc.setFontSize(10);
        doc.setTextColor(80);
        const explanationLines = doc.splitTextToSize(diagramExplanation, pageWidth - 2 * margin);
        
        explanationLines.forEach((line: string) => {
          if (currentY + 5 > pageHeight - margin) {
            doc.addPage();
            currentY = margin;
          }
          doc.text(line, margin, currentY);
          currentY += 5;
        });
      } else {
        if (currentY + 10 > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
        }
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text('No explanation available for this diagram.', margin, currentY);
      }
      
      // Save the PDF
      doc.save('intelligraph-diagram.pdf');
      
    } catch (err: any) {
      console.error("Error generating PDF:", err);
      setError(`PDF generation failed: ${err.message}`);
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Helper function to capture Mermaid diagram as image with enhanced styling
  const captureMermaidDiagram = async (syntax: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Create a temporary container for rendering
        const container = document.createElement('div');
        container.className = 'pdf-mermaid-container';
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        container.style.width = '1200px'; // Increased width for better quality
        container.style.height = 'auto';
        container.style.padding = '30px';
        container.style.backgroundColor = 'white';
        document.body.appendChild(container);
        
        // Determine diagram type to apply appropriate styling
        const diagramType = determineDiagramType(syntax);
        
        // Add enhanced styling based on diagram type
        const styleElement = document.createElement('style');
        styleElement.textContent = generateDiagramStyles(diagramType);
        document.head.appendChild(styleElement);
        
        try {
          // Generate a unique ID for this render
          const uniqueId = `mermaid-pdf-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
          
          // Configure mermaid settings based on diagram type
          configureMermaidForDiagramType(diagramType);
          
          // Parse and render the Mermaid diagram
          await mermaid.parse(syntax);
          
          // Use mermaid.render with only required parameters
          const { svg } = await mermaid.render(uniqueId, syntax);
          container.innerHTML = svg;
          
          // Apply post-render SVG enhancements
          enhanceSvgForPdf(container);
          
          // Allow time for rendering and styling to apply
          await new Promise(r => setTimeout(r, 300));
          
          // Capture the rendered diagram
          const canvas = await html2canvas(container, {
            scale: 3, // Higher scale for better quality
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            onclone: (clonedDoc) => {
              // Add fonts for better text rendering
              const fontLink = clonedDoc.createElement('link');
              fontLink.rel = 'stylesheet';
              fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
              clonedDoc.head.appendChild(fontLink);
              
              // Additional font for technical diagrams
              const technicalFont = clonedDoc.createElement('link');
              technicalFont.rel = 'stylesheet';
              technicalFont.href = 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500&display=swap';
              clonedDoc.head.appendChild(technicalFont);
            }
          });
          
          // Convert to data URL with high quality
          const dataUrl = canvas.toDataURL('image/png', 1.0);
          resolve(dataUrl);
        } finally {
          // Clean up
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
          if (document.head.contains(styleElement)) {
            document.head.removeChild(styleElement);
          }
        }
      } catch (error) {
        console.error('Error capturing Mermaid diagram:', error);
        reject(error);
      }
    });
  };
  
  // Helper function to determine diagram type from syntax
  const determineDiagramType = (syntax: string): string => {
    const lowerSyntax = syntax.toLowerCase();
    if (lowerSyntax.includes('flowchart') || lowerSyntax.includes('graph')) {
      return 'flowchart';
    } else if (lowerSyntax.includes('sequencediagram')) {
      return 'sequence';
    } else if (lowerSyntax.includes('classDiagram')) {
      return 'class';
    } else if (lowerSyntax.includes('erdiagram')) {
      return 'er';
    } else if (lowerSyntax.includes('gantt')) {
      return 'gantt';
    } else if (lowerSyntax.includes('pie')) {
      return 'pie';
    } else if (lowerSyntax.includes('statediagram')) {
      return 'state';
    } else {
      return 'default';
    }
  };
  
  // Configure mermaid settings based on diagram type
  const configureMermaidForDiagramType = (diagramType: string) => {
    // Set global mermaid configuration based on diagram type
    if (typeof mermaid.initialize === 'function') {
      const baseConfig = {
        startOnLoad: false,
        securityLevel: 'loose',
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        themeVariables: {
          primaryColor: '#4a86e8',
          primaryTextColor: '#000000',
          primaryBorderColor: '#7a7a7a',
          lineColor: '#333333',
          secondaryColor: '#006100',
          tertiaryColor: '#fff5ad'
        }
      };
      
      // Apply specific configurations based on diagram type
      switch (diagramType) {
        case 'flowchart':
          mermaid.initialize({
            ...baseConfig,
            flowchart: {
              curve: 'basis',
              htmlLabels: true,
              padding: 15,
              useMaxWidth: false
            }
          });
          break;
        case 'sequence':
          mermaid.initialize({
            ...baseConfig,
            sequence: {
              diagramMarginX: 50,
              diagramMarginY: 30,
              actorMargin: 80,
              boxMargin: 10,
              boxTextMargin: 5,
              noteMargin: 10,
              messageMargin: 35
            }
          });
          break;
        case 'class':
          mermaid.initialize({
            ...baseConfig,
            themeVariables: {
              ...baseConfig.themeVariables,
              primaryColor: '#e1d5e7',
              primaryTextColor: '#000000',
              primaryBorderColor: '#9673a6'
            }
          });
          break;
        case 'er':
          mermaid.initialize({
            ...baseConfig,
            er: {
              entityPadding: 15,
              strokeWidth: 1.5
            },
            themeVariables: {
              ...baseConfig.themeVariables,
              primaryColor: '#dae8fc',
              primaryTextColor: '#000000',
              primaryBorderColor: '#6c8ebf'
            }
          });
          break;
        case 'pie':
          mermaid.initialize({
            ...baseConfig,
            pie: {
              textPosition: 0.5
            }
          });
          break;
        default:
          mermaid.initialize(baseConfig);
          break;
      }
    }
  };
  
  // Generate CSS styles based on diagram type
  const generateDiagramStyles = (diagramType: string): string => {
    // Base styles for all diagram types
    const baseStyles = `
      .pdf-mermaid-container svg {
        background-color: white !important;
        max-width: 100% !important;
        height: auto !important;
      }
      .pdf-mermaid-container svg text {
        font-family: 'Inter', sans-serif !important;
        font-size: 14px !important;
        font-weight: 500 !important;
      }
      .pdf-mermaid-container svg .label {
        fill: #000000 !important;
        color: #000000 !important;
      }
    `;
    
    // Type-specific styles
    let typeSpecificStyles = '';
    
    switch (diagramType) {
      case 'flowchart':
        typeSpecificStyles = `
          .pdf-mermaid-container svg .node rect,
          .pdf-mermaid-container svg .node circle,
          .pdf-mermaid-container svg .node ellipse,
          .pdf-mermaid-container svg .node polygon,
          .pdf-mermaid-container svg .node path {
            stroke: #4a86e8 !important;
            stroke-width: 2px !important;
            fill: #d0e0fc !important;
            filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.1)) !important;
          }
          .pdf-mermaid-container svg .edgePath path,
          .pdf-mermaid-container svg .edgePath .path {
            stroke: #333333 !important;
            stroke-width: 1.5px !important;
          }
          .pdf-mermaid-container svg .arrowheadPath {
            fill: #333333 !important;
            stroke: none !important;
          }
          .pdf-mermaid-container svg .edgeLabel rect {
            fill: #ffffff !important;
            opacity: 0.9 !important;
          }
          .pdf-mermaid-container svg .edgeLabel {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
        `;
        break;
      case 'sequence':
        typeSpecificStyles = `
          .pdf-mermaid-container svg .actor {
            stroke: #6c8ebf !important;
            fill: #dae8fc !important;
            stroke-width: 1.5px !important;
          }
          .pdf-mermaid-container svg .messageLine0,
          .pdf-mermaid-container svg .messageLine1 {
            stroke: #333333 !important;
            stroke-width: 1.5px !important;
          }
          .pdf-mermaid-container svg .messageText {
            fill: #333333 !important;
            font-weight: 600 !important;
          }
          .pdf-mermaid-container svg .loopText,
          .pdf-mermaid-container svg .loopLine {
            stroke: #555555 !important;
            fill: #555555 !important;
          }
          .pdf-mermaid-container svg .note {
            stroke: #bf9000 !important;
            fill: #fff2cc !important;
          }
        `;
        break;
      case 'class':
        typeSpecificStyles = `
          .pdf-mermaid-container svg .classRect {
            stroke: #9673a6 !important;
            fill: #e1d5e7 !important;
            stroke-width: 1.5px !important;
          }
          .pdf-mermaid-container svg .classText {
            fill: #000000 !important;
            font-weight: bold !important;
          }
          .pdf-mermaid-container svg .relation {
            stroke: #333333 !important;
            stroke-width: 1.5px !important;
          }
        `;
        break;
      case 'er':
        typeSpecificStyles = `
          .pdf-mermaid-container svg .entityBox {
            stroke: #6c8ebf !important;
            fill: #dae8fc !important;
            stroke-width: 1.5px !important;
          }
          .pdf-mermaid-container svg .attributeBoxOdd {
            stroke: #82b366 !important;
            fill: #d5e8d4 !important;
            stroke-width: 1px !important;
          }
          .pdf-mermaid-container svg .attributeBoxEven {
            stroke: #82b366 !important;
            fill: #e6f2e6 !important;
            stroke-width: 1px !important;
          }
        `;
        break;
      case 'gantt':
        typeSpecificStyles = `
          .pdf-mermaid-container svg .section {
            stroke: none !important;
            opacity: 0.2 !important;
          }
          .pdf-mermaid-container svg .task {
            stroke: #333333 !important;
            stroke-width: 1px !important;
          }
          .pdf-mermaid-container svg .taskText {
            fill: #000000 !important;
            font-size: 12px !important;
          }
          .pdf-mermaid-container svg .grid .tick line {
            stroke: #e0e0e0 !important;
            opacity: 0.5 !important;
          }
        `;
        break;
      case 'pie':
        typeSpecificStyles = `
          .pdf-mermaid-container svg .pieCircle {
            stroke: #ffffff !important;
            stroke-width: 1px !important;
          }
          .pdf-mermaid-container svg .pieTitleText {
            font-size: 16px !important;
            font-weight: bold !important;
            fill: #333333 !important;
          }
          .pdf-mermaid-container svg .slice {
            font-size: 14px !important;
            font-weight: 500 !important;
            fill: #ffffff !important;
          }
        `;
        break;
      case 'state':
        typeSpecificStyles = `
          .pdf-mermaid-container svg .stateGroup rect {
            stroke: #9673a6 !important;
            fill: #e1d5e7 !important;
            stroke-width: 1.5px !important;
          }
          .pdf-mermaid-container svg .stateText {
            fill: #000000 !important;
            font-weight: bold !important;
          }
          .pdf-mermaid-container svg .transition {
            stroke: #333333 !important;
            stroke-width: 1.5px !important;
          }
        `;
        break;
      default:
        typeSpecificStyles = `
          .pdf-mermaid-container svg .node rect,
          .pdf-mermaid-container svg .node circle,
          .pdf-mermaid-container svg .node ellipse,
          .pdf-mermaid-container svg .node polygon,
          .pdf-mermaid-container svg .node path {
            stroke: #555555 !important;
            fill: #f0f0f0 !important;
            stroke-width: 1.5px !important;
          }
          .pdf-mermaid-container svg .edgePath path,
          .pdf-mermaid-container svg .edgePath .path {
            stroke: #333333 !important;
            stroke-width: 1.5px !important;
          }
          .pdf-mermaid-container svg .arrowheadPath {
            fill: #333333 !important;
          }
        `;
        break;
    }
    
    return baseStyles + typeSpecificStyles;
  };
  
  // Apply post-render enhancements to the SVG
  const enhanceSvgForPdf = (container: HTMLElement) => {
    const svg = container.querySelector('svg');
    if (!svg) return;
    
    // Ensure SVG has proper dimensions
    svg.setAttribute('width', '100%');
    svg.style.maxWidth = '100%';
    svg.style.height = 'auto';
    
    // Add a subtle drop shadow to the entire diagram
    svg.style.filter = 'drop-shadow(0px 2px 3px rgba(0,0,0,0.2))';
    
    // Enhance text elements for better readability
    const textElements = svg.querySelectorAll('text');
    textElements.forEach((text: SVGTextElement) => {
      // Ensure text has good contrast
      if (!text.getAttribute('fill') || text.getAttribute('fill') === '#000000') {
        text.setAttribute('fill', '#000000');
      }
      
      // Improve text clarity
      text.style.fontWeight = '500';
      text.style.fontSize = '14px';
    });
  };

  
  // Helper function to capture ReactFlow diagram as image with enhanced styling
  const captureReactFlowDiagram = async (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!diagramOutputRef.current) {
          reject(new Error("Diagram container reference not found"));
          return;
        }
        
        const reactFlowPane = diagramOutputRef.current.querySelector('.react-flow__viewport') as HTMLElement;
        if (!reactFlowPane) {
          reject(new Error("React Flow pane not found"));
          return;
        }
        
        // Add enhanced styling for ReactFlow diagrams in PDF
        const styleElement = document.createElement('style');
        styleElement.textContent = `
          /* Enhanced ReactFlow styling for PDF export */
          .react-flow__node {
            font-family: 'Inter', sans-serif !important;
            font-weight: 500 !important;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
            border-radius: 6px !important;
            border-width: 2px !important;
          }
          
          .react-flow__node-default {
            background-color: #e6f2ff !important;
            border-color: #4a86e8 !important;
            color: #000000 !important;
          }
          
          .react-flow__node-input {
            background-color: #d5e8d4 !important;
            border-color: #82b366 !important;
            color: #000000 !important;
          }
          
          .react-flow__node-output {
            background-color: #ffe6cc !important;
            border-color: #d79b00 !important;
            color: #000000 !important;
          }
          
          .react-flow__edge-path {
            stroke: #333333 !important;
            stroke-width: 2px !important;
          }
          
          .react-flow__edge-text {
            font-family: 'Inter', sans-serif !important;
            font-weight: 500 !important;
            fill: #000000 !important;
            background-color: white !important;
            padding: 2px !important;
          }
          
          .react-flow__edge-textbg {
            fill: white !important;
          }
          
          .react-flow__controls {
            display: none !important;
          }
          
          .react-flow__attribution {
            display: none !important;
          }
        `;
        document.head.appendChild(styleElement);
        
        try {
          // Apply temporary styling to enhance nodes for PDF
          const nodes = reactFlowPane.querySelectorAll('.react-flow__node');
          const originalStyles: {[key: string]: {[key: string]: string}} = {};
          
          // Store original styles and apply enhanced styles
          nodes.forEach((node, index) => {
            const nodeId = `node-${index}`;
            originalStyles[nodeId] = {};
            
            // Store original styles
            ['boxShadow', 'borderWidth', 'backgroundColor', 'color', 'fontWeight'].forEach(prop => {
              originalStyles[nodeId][prop] = (node as HTMLElement).style[prop as any];
            });
            
            // Apply enhanced styles for PDF
            (node as HTMLElement).style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            (node as HTMLElement).style.borderWidth = '2px';
            (node as HTMLElement).style.fontWeight = '500';
          });
          
          // Allow time for styles to apply
          await new Promise(r => setTimeout(r, 100));
          
          // Capture the diagram with enhanced quality
          const canvas = await html2canvas(reactFlowPane, {
            scale: 3, // Higher scale for better quality
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            onclone: (clonedDoc) => {
              // Add fonts for better text rendering
              const fontLink = clonedDoc.createElement('link');
              fontLink.rel = 'stylesheet';
              fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
              clonedDoc.head.appendChild(fontLink);
              
              // Add ReactFlow styles
              const reactFlowStyles = clonedDoc.createElement('link');
              reactFlowStyles.rel = 'stylesheet';
              reactFlowStyles.href = 'https://cdn.jsdelivr.net/npm/reactflow@latest/dist/style.css';
              clonedDoc.head.appendChild(reactFlowStyles);
              
              // Apply the enhanced styles to the cloned document
              const enhancedStyles = clonedDoc.createElement('style');
              enhancedStyles.textContent = styleElement.textContent;
              clonedDoc.head.appendChild(enhancedStyles);
            }
          });
          
          // Convert to data URL with high quality
          const dataUrl = canvas.toDataURL('image/png', 1.0);
          resolve(dataUrl);
        } finally {
          // Clean up the style element
          if (document.head.contains(styleElement)) {
            document.head.removeChild(styleElement);
          }
        }
      } catch (error) {
        console.error('Error capturing ReactFlow diagram:', error);
        reject(error);
      }
    });
  };



  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen bg-slate-900 text-slate-100">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            generationMode={generationMode}
            setGenerationMode={handleGenerationModeChange}
            activeModule={activeModule}
            setActiveModule={handleActiveModuleChange}
            diagramStyle={diagramStyle}
            setDiagramStyle={handleDiagramStyleChange}
            selectedDiagramType={selectedDiagramType}
            setSelectedDiagramType={handleDiagramTypeChange}
          />
          <main className="flex-1 flex flex-col p-4 md:p-6 space-y-4 overflow-y-auto bg-slate-800 custom-scrollbar">
            <InputArea
              module={activeModule}
              diagramStyle={diagramStyle}
              selectedDiagramType={selectedDiagramType}
              inputText={currentInputText}
              onInputChange={(value) => setCurrentInputText(value)}
              onGenerate={handleGenerateDiagram}
              isLoading={isLoading}
              onClear={() => {
                const currentPromptKey = selectedDiagramType as keyof typeof AVAILABLE_DIAGRAM_TYPES;
                const diagramTypeDef = AVAILABLE_DIAGRAM_TYPES[currentPromptKey];
                if (activeModule === DiagramModule.TEXT) {
                  setCurrentInputText(selectedDiagramType === SimpleDiagramType.MERMAID_MIND_MAP ? DEFAULT_PROMPT_MERMAID : (diagramTypeDef?.module === DiagramModule.TEXT ? DEFAULT_PROMPT_TEXT : DEFAULT_PROMPT_TEXT));
                } else {
                  setCurrentInputText(DEFAULT_PROMPT_CODE);
                }
                resetDiagramArea();
              }}
              generationMode={generationMode}
            />
            {error && <div className="p-3 bg-red-800 text-red-100 rounded-md shadow-lg font-medium">{error}</div>}
            {isLoading && <LoadingSpinner />}
            
            <div 
              ref={diagramOutputRef} 
              className="flex-1 bg-slate-700 rounded-lg shadow-xl min-h-[300px] md:min-h-[400px] border border-slate-600 p-1 flex flex-col"
            > 
              {mermaidSyntax ? (
                <MermaidDiagramRenderer 
                  initialMermaidSyntax={mermaidSyntax}
                />
              ) : (nodes.length > 0 || edges.length > 0) ? (
                <DiagramView
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                />
              ) : !isLoading && !error && (
                 <div className="text-slate-400 text-center p-4 flex flex-col justify-center items-center h-full"> {/* Centering for placeholder content */}
                    <p className="text-5xl mb-4 animate-bounce">💡</p>
                    <p className="text-lg font-medium">Your diagram will appear here.</p>
                    <p className="text-sm text-slate-500">
                      {generationMode === GenerationMode.SMART
                        ? 'Enter your text/code, and the AI will choose the best diagram type for you!'
                        : 'Select a mode and type, enter your text/code, and click "Generate".'}
                    </p>
                </div>
              )}
            </div>
            
            {diagramExplanation && !isLoading && (
              <div ref={explanationRef} className="mt-3 p-4 bg-slate-700 rounded-lg shadow-md border border-slate-600">
                <h3 className="text-lg font-semibold text-sky-300 mb-2">Explanation</h3>
                <p className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">{diagramExplanation}</p>
              </div>
            )}

            { (mermaidSyntax || (nodes.length > 0 && edges.length >=0)) && !isLoading && (
              <div className="mt-2 flex justify-end">
                <Button
                  onClick={handleDownloadDiagram}
                  disabled={isDownloading}
                  variant="secondary"
                  className="text-sm py-2.5 px-5"
                >
                  {isDownloading ? (
                    <>
                      <svg aria-hidden="true" className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating PDF...
                    </>
                  ) : (
                    'Download PDF'
                  )}
                </Button>
              </div>
            )}

          </main>
        </div>
      </div>
    </ReactFlowProvider>
  );
};

export default App;
