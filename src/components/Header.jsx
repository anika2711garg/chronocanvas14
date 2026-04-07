import React, { useContext } from 'react';
import { Moon, Sun, Camera, Home, XCircle } from 'lucide-react';
import { ThemeContext } from '../App';

export function Header({ onJumpToToday, onClearSelection, onExportImage, hasSelection }) {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-end justify-between mb-5 sm:mb-7 gap-4 sm:gap-5 px-1">
      <div className="text-center sm:text-left">
        <p className="text-[11px] tracking-[0.22em] uppercase text-[color:var(--ink-700)]/75 dark:text-slate-300/75 mb-1.5">
          Handcrafted planner
        </p>
        <h1 className="month-mark text-4xl sm:text-5xl font-semibold text-[color:var(--ink-900)] dark:text-slate-50 tracking-tight leading-none transition-colors">
          ChronoCanvas
        </h1>
        <p className="text-[color:var(--ink-700)]/80 dark:text-slate-300/80 mt-2 font-medium transition-colors">Calendar and notes with a paper-like touch</p>
      </div>
      
      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5">
        {hasSelection && (
          <button 
            onClick={onClearSelection}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-full text-[#7b4a42] bg-[#efe2dc] dark:bg-[#55342f]/60 dark:text-[#f0c4b8] hover:brightness-95 transition"
          >
            <XCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
        
        <button 
          onClick={onJumpToToday}
          className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-full text-[color:var(--ink-900)] dark:text-slate-100 bg-white/80 dark:bg-slate-800/80 border border-white/70 dark:border-slate-700/80 hover:-translate-y-0.5 transition shadow-[0_6px_16px_rgba(34,52,62,0.12)]"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Today</span>
        </button>

        <button 
          onClick={onExportImage}
          className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-full text-white bg-[color:var(--color-active-600)] hover:bg-[color:var(--color-active-700)] transition shadow-[0_10px_20px_color-mix(in_srgb,var(--color-active-700)_35%,transparent)]"
        >
          <Camera className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </button>

        <div className="w-px h-6 bg-[color:var(--ink-700)]/20 dark:bg-slate-500/50 mx-1"></div>

        <button 
          onClick={toggleDarkMode}
          className="p-2.5 rounded-full text-[color:var(--ink-700)] dark:text-slate-200 bg-white/70 dark:bg-slate-800/70 hover:scale-[1.04] transition"
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
