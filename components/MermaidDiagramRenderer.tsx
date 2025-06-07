
import React, { useEffect, useRef, useState } from 'react';
// Removed Button import as it's no longer used here

// Ensure mermaid is globally available from CDN
declare const mermaid: any;

interface MermaidDiagramRendererProps {
  initialMermaidSyntax: string; // The AI-generated syntax
}

const MermaidDiagramRenderer: React.FC<MermaidDiagramRendererProps> = ({ 
  initialMermaidSyntax,
}) => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const currentMermaidDiv = mermaidRef.current;
    if (!currentMermaidDiv) return;

    if (!initialMermaidSyntax) {
      currentMermaidDiv.innerHTML = ''; 
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    currentMermaidDiv.innerHTML = '<div class="text-slate-400 p-4">Preparing Mermaid diagram...</div>'; 

    if (typeof mermaid === 'undefined' || !mermaid || typeof mermaid.render !== 'function') {
      const libErrorMsg = "Mermaid.js library is not loaded.";
      setError(libErrorMsg);
      if (mermaidRef.current === currentMermaidDiv) { 
          currentMermaidDiv.innerHTML = `<div class="text-red-300 p-4 bg-red-900 bg-opacity-50 rounded w-full h-full text-sm"><p class="font-bold">${libErrorMsg}</p></div>`;
      }
      setIsLoading(false);
      return;
    }

    const renderDiagramAsync = async () => {
      try {
        const uniqueId = `mermaid-graph-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        
        if (mermaidRef.current === currentMermaidDiv) {
             currentMermaidDiv.innerHTML = ''; 
        } else {
            return; // Component unmounted or div changed
        }

        const { svg, bindFunctions } = await mermaid.render(uniqueId, initialMermaidSyntax); 
        
        if (mermaidRef.current === currentMermaidDiv) { 
          currentMermaidDiv.innerHTML = svg;
          const svgElement = currentMermaidDiv.querySelector('svg');
          if (svgElement) {
            svgElement.style.maxWidth = '100%';
            svgElement.style.height = 'auto';
            svgElement.style.margin = 'auto';
          }
          if (bindFunctions) bindFunctions(currentMermaidDiv); 
          setError(null); 
        }
      } catch (e: any) {
        console.error("Mermaid rendering error:", e);
        const errorMessage = e.message || 'Could not render diagram.';
        setError(`Mermaid Diagram Error: ${errorMessage}`); 
        if (mermaidRef.current === currentMermaidDiv) { 
          currentMermaidDiv.innerHTML = `<div class="text-red-300 p-3 bg-red-900 bg-opacity-60 rounded w-full h-full overflow-auto text-xs custom-scrollbar">
            <p class="font-bold text-sm mb-1">Diagram Rendering Error:</p>
            <pre class="whitespace-pre-wrap font-mono text-red-200">${errorMessage}</pre>
            <p class="mt-2 font-bold text-sm mb-1">Syntax (from AI/Load):</p>
            <pre class="whitespace-pre-wrap font-mono text-slate-300">${initialMermaidSyntax}</pre>
          </div>`;
        }
      } finally {
        setIsLoading(false);
      }
    };

    const timerId = setTimeout(renderDiagramAsync, 50);
    return () => clearTimeout(timerId);

  }, [initialMermaidSyntax]); 

  return (
    <div className="w-full h-full flex flex-col justify-start items-center overflow-hidden p-2 bg-slate-700 rounded-md space-y-2">
      {/* Removed Mermaid editor textarea and re-render button */}
      <div className="w-full flex-grow flex flex-col justify-center items-center overflow-hidden min-h-[200px]">
        {isLoading && !mermaidRef.current?.innerHTML.includes('Error') && (
          <div className="text-slate-300 p-4">Rendering Mermaid diagram...</div>
        )}
        
        {error && !isLoading && !error.toLowerCase().includes("mermaid diagram error") && (
           <div className="text-red-300 p-4 bg-red-900 bg-opacity-50 rounded-md w-full max-w-md text-sm overflow-auto custom-scrollbar">
            <p className="font-bold mb-2">System Error:</p>
            <pre className="whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        <div
          ref={mermaidRef}
          className={`mermaid-display-area w-full h-full flex justify-center items-center overflow-auto custom-scrollbar p-1 ${isLoading ? 'opacity-70' : ''}`}
          aria-live="polite"
          aria-label="Mermaid diagram output area"
        >
          {!initialMermaidSyntax && !isLoading && !error && <div className="text-slate-500 p-4">No Mermaid syntax provided.</div>}
        </div>
      </div>
    </div>
  );
};

export default MermaidDiagramRenderer;
