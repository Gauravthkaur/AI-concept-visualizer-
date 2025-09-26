
import React from 'react';
// Removed Button import as it's no longer used here

interface HeaderProps {
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMobileMenuOpen }) => {
  return (
    <header className="bg-slate-900 p-4 shadow-lg text-slate-100 border-b border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={onMenuToggle}
            className="md:hidden mr-4 text-slate-300 hover:text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-bold">
              <span className="text-sky-400">Intelli</span>
              <span className="text-emerald-400">Graph</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1 hidden sm:block">
              AI-Powered Visual Content & Code Diagram Generator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
