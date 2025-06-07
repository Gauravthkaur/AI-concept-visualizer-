
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center p-6 space-y-3 bg-slate-700/50 rounded-lg my-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-sky-400"></div>
      <p className="text-slate-200 font-medium">Generating diagram, please wait...</p>
    </div>
  );
};

export default LoadingSpinner;
