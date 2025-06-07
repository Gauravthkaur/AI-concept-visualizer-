
import React from 'react';
// Removed Button import as it's no longer used here

interface HeaderProps {
  // onManageApiKey prop removed
}

const Header: React.FC<HeaderProps> = () => { // Removed onManageApiKey from props
  return (
    <header className="bg-slate-900 p-4 shadow-lg text-slate-100 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-center">
      <div className="text-center sm:text-left mb-2 sm:mb-0 flex-grow">
        <h1 className="text-3xl font-bold">
          <span className="text-sky-400">Intelli</span>
          <span className="text-emerald-400">Graph</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">AI-Powered Visual Content & Code Diagram Generator</p>
      </div>
      {/* "Manage API Key" button removed */}
    </header>
  );
};

export default Header;
