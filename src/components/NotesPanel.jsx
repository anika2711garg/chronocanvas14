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
    <div className="w-full lg:w-[27rem] bg-[#f8f4ea] dark:bg-[#1d252c]/88 p-6 md:p-7 flex flex-col h-full rounded-b-[1.8rem] lg:rounded-bl-none lg:rounded-br-[1.8rem] border-t lg:border-t-0 lg:border-l border-[#e8decc]/80 dark:border-slate-700/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3)] transition-colors">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#d9cfbd]/80 dark:border-slate-700/70">
        <div className="p-2 bg-[color:var(--color-active-100)] dark:bg-[color:var(--color-active-600)]/25 text-[color:var(--color-active-700)] dark:text-[color:var(--color-active-100)] rounded-xl transition-colors">
          <StickyNote className="w-5 h-5" />
        </div>
        <div>
          <h3 className="month-mark text-xl font-semibold text-[color:var(--ink-900)] dark:text-slate-100 leading-tight transition-colors">
            Notes & Events
          </h3>
          <p className="text-xs text-[color:var(--ink-700)]/75 dark:text-slate-400 mt-0.5 flex items-center gap-1 transition-colors">
            <Calendar className="w-3 h-3" />
            {getContextLabel()}
          </p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col relative group rounded-2xl px-3 pt-2 pb-6 bg-[#fdfbf6]/75 dark:bg-slate-800/70 shadow-[0_10px_22px_rgba(65,57,43,0.12)]">
        <div className="pointer-events-none absolute left-6 right-5 top-6 bottom-4 opacity-60">
          <div className="h-full w-full bg-[repeating-linear-gradient(transparent,transparent_33px,rgba(130,103,74,0.18)_33px,rgba(130,103,74,0.18)_34px)] dark:bg-[repeating-linear-gradient(transparent,transparent_33px,rgba(159,181,192,0.15)_33px,rgba(159,181,192,0.15)_34px)]" />
        </div>

        <div className="notes-script text-[color:var(--ink-700)]/70 dark:text-slate-300/75 text-[1.15rem] mb-2 px-1">Dear future me,</div>
        <textarea
          value={noteContent}
          onChange={handleNoteChange}
          placeholder={startDate 
            ? "Jot down plans, reminders, or tasks for this specific date..." 
            : "Write down monthly goals or general reminders..."}
          className="relative flex-1 w-full bg-transparent resize-none outline-none text-[color:var(--ink-900)] dark:text-slate-200 placeholder:text-[color:var(--ink-700)]/45 dark:placeholder:text-slate-500/65 text-[15px] leading-[34px] custom-scrollbar font-medium transition-colors px-1"
        />
        
        {/* Subtle hint when hovering */}
        <div className="absolute -bottom-5 right-0 text-[10px] text-[color:var(--color-active-700)]/60 dark:text-[color:var(--color-active-100)]/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <Info className="w-3 h-3" /> Auto-saved locally
        </div>
      </div>
    </div>
  );
}
