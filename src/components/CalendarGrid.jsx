import React, { useState, useEffect } from 'react';
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, format, isSameMonth, isSameDay, 
  isToday, isAfter, isBefore, addMonths, subMonths,
  setYear, isWeekend
} from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function CalendarGrid({ 
  currentDate, setCurrentDate, 
  startDate, setStartDate, 
  endDate, setEndDate 
}) {
  const [hoverDate, setHoverDate] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dots, setDots] = useState({});

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDateOfGrid = startOfWeek(monthStart);
  const endDateOfGrid = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDateOfGrid, end: endDateOfGrid });

  const currentYear = currentDate.getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  // Sync dots based on localStorage notes
  useEffect(() => {
    const newDots = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('notes_')) {
        // Simple logic: if there's a note for exact date, or monthly note
        if (localStorage.getItem(key).trim() !== '') {
          newDots[key] = true;
        }
      }
    }
    setDots(newDots);
  }, [currentDate, startDate, endDate]);

  const hasNoteForDate = (date) => {
    const specificDateKey = `notes_${format(date, 'yyyy-MM-dd')}`;
    return !!dots[specificDateKey] || !!dots[`notes_${format(date, 'yyyy-MM-dd')}_to_${format(date, 'yyyy-MM-dd')}`];
  };

  const hasNoteInSelection = (day) => {
    // If it falls in a saved range... for performance just checking if it is exactly a saved range or date.
    return hasNoteForDate(day);
  };

  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleYearChange = (e) => setCurrentDate(setYear(currentDate, parseInt(e.target.value)));

  const handleMouseDown = (day) => {
    setStartDate(day);
    setEndDate(null);
    setIsDragging(true);
  };

  const handleMouseEnter = (day) => {
    if (isDragging && startDate) {
      if (isBefore(day, startDate)) {
        setEndDate(startDate);
        setStartDate(day);
      } else {
        setEndDate(day);
      }
    } else if (startDate && !endDate && !isDragging) {
      setHoverDate(day);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseClick = (day) => {
    if (!isDragging) {
      if (!startDate || (startDate && endDate)) {
        setStartDate(day);
        setEndDate(null);
      } else if (startDate && !endDate) {
        if (isBefore(day, startDate)) {
          setEndDate(startDate);
          setStartDate(day);
        } else if (isSameDay(day, startDate)) {
          setStartDate(day);
          setEndDate(day);
        } else {
          setEndDate(day);
        }
        setHoverDate(null);
      }
    }
  };

  const isInRange = (day) => {
    if (!startDate || !endDate) return false;
    return (isAfter(day, startDate) || isSameDay(day, startDate)) && 
           (isBefore(day, endDate) || isSameDay(day, endDate));
  };

  const isHoverRange = (day) => {
    if (startDate && !endDate && hoverDate && !isDragging) {
      const early = isBefore(startDate, hoverDate) ? startDate : hoverDate;
      const late = isAfter(startDate, hoverDate) ? startDate : hoverDate;
      return (isAfter(day, early) || isSameDay(day, early)) && 
             (isBefore(day, late) || isSameDay(day, late));
    }
    return false;
  };

  return (
    <div 
      className="w-full bg-white dark:bg-slate-800 p-4 sm:p-6 md:p-8 rounded-b-2xl md:rounded-bl-2xl md:rounded-br-none shadow-sm h-full flex flex-col transition-colors border-t border-slate-100 dark:border-slate-700/50"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100">
            {format(currentDate, 'MMMM')}
          </h2>
          <div className="relative">
            <select 
              value={currentDate.getFullYear()} 
              onChange={handleYearChange}
              className="appearance-none bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-1 pl-3 pr-8 rounded-md font-medium text-lg cursor-pointer outline-none cursor-pointer focus:ring-2 focus:ring-primary-500 transition-colors"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handlePrevMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors group"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
          </button>
          <button 
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors group"
            aria-label="Next Month"
          >
            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 py-2 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 flex-grow auto-rows-fr">
        {days.map((day) => {
          const isSelectedStart = startDate && isSameDay(day, startDate);
          const isSelectedEnd = endDate && isSameDay(day, endDate);
          const highlighted = isInRange(day);
          const shadowHovered = isHoverRange(day);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const weekend = isWeekend(day);
          const hasNotes = hasNoteInSelection(day);
          
          return (
            <button
              key={day.toISOString()}
              onMouseDown={() => handleMouseDown(day)}
              onMouseEnter={() => handleMouseEnter(day)}
              onClick={() => handleMouseClick(day)}
              disabled={!isCurrentMonth}
              className={cn(
                "relative flex items-center justify-center rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-200 border border-transparent outline-none overflow-hidden select-none",
                !isCurrentMonth && "text-slate-200 dark:text-slate-700 pointer-events-none",
                isCurrentMonth && "text-slate-700 dark:text-slate-300 hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50",
                isCurrentMonth && weekend && !highlighted && !shadowHovered && "text-rose-500 dark:text-rose-400",
                
                // Shadow Hover states
                shadowHovered && !highlighted && "bg-primary-50/50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300",
                
                // Selection states
                highlighted && "bg-primary-100 dark:bg-primary-500/20 text-primary-900 dark:text-primary-100 border-none",
                (isSelectedStart || isSelectedEnd) && "bg-primary-600 dark:bg-primary-500 text-white shadow-md shadow-primary-500/30 hover:bg-primary-700 dark:hover:bg-primary-600",
                
                // Radius connections
                highlighted && !isSelectedStart && !isSelectedEnd && "rounded-none",
                highlighted && isSelectedStart && !isSelectedEnd && endDate && "rounded-r-none",
                highlighted && isSelectedEnd && !isSelectedStart && startDate && "rounded-l-none"
              )}
            >
              {isToday(day) && !isSelectedStart && !isSelectedEnd && !highlighted && (
                <div className="absolute top-1 lg:top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary-400 dark:bg-primary-500 opacity-30" />
              )}
              {format(day, 'd')}
              
              {/* Event Dot Badge */}
              {hasNotes && (
                <div className={cn(
                  "absolute bottom-1 w-1.5 h-1.5 rounded-full transition-colors",
                  (isSelectedStart || isSelectedEnd) ? "bg-white" : "bg-primary-500 dark:bg-primary-400"
                )} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
