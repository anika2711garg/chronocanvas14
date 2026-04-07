import React, { useContext } from 'react';
import { Moon, Sun, Camera, Home, XCircle } from 'lucide-react';
import { ThemeContext } from '../App';

export function Header({ onJumpToToday, onClearSelection, onExportImage, hasSelection }) {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <div className="w-full flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
      <div className="text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight transition-colors">
          ChronoCanvas
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium transition-colors">Interactive Wall Calendar</p>
      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-2">
        {hasSelection && (
          <button 
            onClick={onClearSelection}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-rose-600 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
        
        <button 
          onClick={onJumpToToday}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-slate-700 bg-white dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Today</span>
        </button>

        <button 
          onClick={onExportImage}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Camera className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </button>

        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>

        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
