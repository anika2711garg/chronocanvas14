import React, { useState, useEffect } from 'react';
import { format, isSameDay } from 'date-fns';
import { StickyNote, Calendar, Info } from 'lucide-react';

export function NotesPanel({ currentDate, startDate, endDate }) {
  const [noteContent, setNoteContent] = useState('');

  // Determine the current context key
  const getStorageKey = () => {
    if (startDate && endDate && !isSameDay(startDate, endDate)) {
      return `notes_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}`;
    } else if (startDate && (!endDate || isSameDay(startDate, endDate))) {
      return `notes_${format(startDate, 'yyyy-MM-dd')}`;
    }
    return `notes_month_${format(currentDate, 'yyyy-MM')}`;
  };

  const getContextLabel = () => {
    if (startDate && endDate && !isSameDay(startDate, endDate)) {
      return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
    } else if (startDate && (!endDate || isSameDay(startDate, endDate))) {
      return format(startDate, 'MMMM d, yyyy');
    }
    return format(currentDate, 'MMMM yyyy');
  };

  const currentKey = getStorageKey();

  useEffect(() => {
    const savedNote = localStorage.getItem(currentKey) || '';
    setNoteContent(savedNote);
  }, [currentKey]);

  const handleNoteChange = (e) => {
    const val = e.target.value;
    setNoteContent(val);
    if (val.trim() === '') {
      localStorage.removeItem(currentKey);
    } else {
      localStorage.setItem(currentKey, val);
    }
  };

  return (
    <div className="w-full md:w-80 lg:w-96 bg-primary-50/50 dark:bg-slate-800/80 p-6 md:p-8 flex flex-col h-full rounded-b-2xl md:rounded-bl-none md:rounded-br-2xl border-t md:border-t-0 md:border-l border-primary-200/50 dark:border-slate-700/50 shadow-inner transition-colors">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-primary-200/60 dark:border-slate-700">
        <div className="p-2 bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400 rounded-lg transition-colors">
          <StickyNote className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 leading-tight transition-colors">
            Notes & Events
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1 transition-colors">
            <Calendar className="w-3 h-3" />
            {getContextLabel()}
          </p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col relative group">
        <textarea
          value={noteContent}
          onChange={handleNoteChange}
          placeholder={startDate 
            ? "Jot down plans, reminders, or tasks for this specific date..." 
            : "Write down monthly goals or general reminders..."}
          className="flex-1 w-full bg-transparent resize-none outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400/60 dark:placeholder:text-slate-500/50 text-[15px] leading-relaxed custom-scrollbar font-sans transition-colors"
          style={{
            backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, var(--color-primary-500) 31px, var(--color-primary-500) 32px)",
            backgroundSize: "100% 32px",
            backgroundPosition: "0 6px",
            lineHeight: "32px",
            paddingTop: "6px",
            opacity: 0.8
          }}
        />
        
        {/* Subtle hint when hovering */}
        <div className="absolute -bottom-4 right-0 text-[10px] text-primary-600/50 dark:text-primary-400/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <Info className="w-3 h-3" /> Auto-saved locally
        </div>
      </div>
    </div>
  );
}
