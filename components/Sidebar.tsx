
import React from 'react';
import { DiagramModule, GeneralDiagramType, CodeDiagramType, AllDiagramType, DiagramStyle, SimpleDiagramType, GenerationMode } from '../types';
import { AVAILABLE_DIAGRAM_TYPES } from '../constants';
import Button from './Button'; // Import Button component

interface SidebarProps {
  generationMode: GenerationMode;
  setGenerationMode: (mode: GenerationMode) => void;
  activeModule: DiagramModule;
  setActiveModule: (module: DiagramModule) => void;
  diagramStyle: DiagramStyle;
  setDiagramStyle: (style: DiagramStyle) => void;
  selectedDiagramType: AllDiagramType;
  setSelectedDiagramType: (type: AllDiagramType) => void;
  // Removed onSave and onLoad props
}

const Sidebar: React.FC<SidebarProps> = ({
  generationMode,
  setGenerationMode,
  activeModule,
  setActiveModule,
  diagramStyle,
  setDiagramStyle,
  selectedDiagramType,
  setSelectedDiagramType,
  // Removed onSave, onLoad
}) => {

  const isManualMode = generationMode === GenerationMode.MANUAL;

  const renderDiagramTypes = () => {
    let types: AllDiagramType[] = [];

    if (activeModule === DiagramModule.TEXT) {
      if (diagramStyle === DiagramStyle.STANDARD) {
        types = Object.values(GeneralDiagramType) as GeneralDiagramType[];
      } else {
        types = Object.values(SimpleDiagramType) as SimpleDiagramType[];
      }
    } else { 
      types = Object.values(CodeDiagramType) as CodeDiagramType[];
    }

    return types.map((type) => (
      <button
        key={type}
        onClick={() => setSelectedDiagramType(type)}
        disabled={!isManualMode}
        className={`w-full text-left p-3 rounded-lg transition-all duration-200 ease-in-out group
                    ${selectedDiagramType === type && isManualMode
                      ? 'bg-sky-600 text-white shadow-xl ring-2 ring-sky-400' 
                      : isManualMode 
                        ? 'bg-slate-700 hover:bg-sky-700 hover:text-white hover:shadow-md text-slate-200'
                        : 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                    }`}
        aria-pressed={selectedDiagramType === type && isManualMode}
        aria-disabled={!isManualMode}
        title={isManualMode ? `Select ${type} diagram type` : 'Diagram type is auto-selected in Smart Mode'}
      >
        <span className="font-medium">{type}</span>
        <p className={`text-xs mt-1 ${selectedDiagramType === type && isManualMode ? 'text-sky-100' : isManualMode ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-500'}`}>
          {AVAILABLE_DIAGRAM_TYPES[type as keyof typeof AVAILABLE_DIAGRAM_TYPES]?.description}
        </p>
      </button>
    ));
  };

  return (
    <aside className="w-80 md:w-96 bg-slate-850 border-r border-slate-700 shadow-2xl flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-6 p-5 custom-scrollbar"> 
        
        {/* Removed Session Save/Load section */}
        
        <div>
          <h2 className="text-lg font-semibold mb-3 text-fuchsia-400 border-b border-slate-700 pb-2">Generation Mode</h2>
          <div className="grid grid-cols-2 gap-2">
            {(Object.values(GenerationMode) as GenerationMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setGenerationMode(mode)}
                className={`p-3 rounded-md text-sm font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-850
                            ${generationMode === mode 
                              ? 'bg-fuchsia-500 text-white shadow-lg ring-fuchsia-300' 
                              : 'bg-slate-700 hover:bg-fuchsia-600 hover:text-white text-slate-200'
                            }`}
                aria-pressed={generationMode === mode}
                title={`Switch to ${mode}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 text-sky-400 border-b border-slate-700 pb-2">Input Mode</h2>
          <div className="grid grid-cols-2 gap-2">
            {(Object.values(DiagramModule) as DiagramModule[]).map((module) => (
              <button
                key={module}
                onClick={() => setActiveModule(module)}
                className={`p-3 rounded-md text-sm font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-850
                            ${activeModule === module 
                              ? 'bg-emerald-500 text-white shadow-lg ring-emerald-300' 
                              : 'bg-slate-700 hover:bg-emerald-600 hover:text-white text-slate-200'
                            }`}
                aria-pressed={activeModule === module}
                title={`Switch to ${module} mode`}
              >
                {module}
              </button>
            ))}
          </div>
        </div>

        {activeModule === DiagramModule.TEXT && (
          <div className={`${!isManualMode ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <h2 className={`text-lg font-semibold mb-3 border-b border-slate-700 pb-2 ${isManualMode ? 'text-sky-400' : 'text-slate-500'}`}>
              Diagram Style {!isManualMode && <span className="text-xs">(AI Controlled)</span>}
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {(Object.values(DiagramStyle) as DiagramStyle[]).map((style) => (
                <button
                  key={style}
                  onClick={() => setDiagramStyle(style)}
                  disabled={!isManualMode}
                  className={`p-3 rounded-md text-sm font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-850
                              ${diagramStyle === style && isManualMode
                                ? 'bg-indigo-500 text-white shadow-lg ring-indigo-300' 
                                : isManualMode
                                  ? 'bg-slate-700 hover:bg-indigo-600 hover:text-white text-slate-200'
                                  : 'bg-slate-600 text-slate-400' 
                              }`}
                  aria-pressed={diagramStyle === style && isManualMode}
                  aria-disabled={!isManualMode}
                  title={isManualMode ? `Switch to ${style} style` : 'Style is auto-selected in Smart Mode'}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={`${!isManualMode ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <h2 className={`text-lg font-semibold mb-3 border-b border-slate-700 pb-2 ${isManualMode ? 'text-sky-400' : 'text-slate-500'}`}>
            Diagram Type {!isManualMode && <span className="text-xs">(AI Controlled)</span>}
          </h2>
          <div className="space-y-2">
            {renderDiagramTypes()}
          </div>
        </div>
      </div>
      
      <div className="p-5 border-t border-slate-700 bg-slate-900"> 
        <p className="text-xs text-slate-500 text-center">
          IntelliGraph &copy; {new Date().getFullYear()}. 
        </p>
         <p className="text-xs text-slate-600 text-center mt-1">Visualizing complexity, simply.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
