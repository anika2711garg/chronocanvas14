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
import { motion, AnimatePresence } from 'framer-motion';

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
  const [customHolidays, setCustomHolidays] = useState([]);
  const [navDirection, setNavDirection] = useState(1);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDateOfGrid = startOfWeek(monthStart);
  const endDateOfGrid = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDateOfGrid, end: endDateOfGrid });

  const currentYear = currentDate.getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);
  const monthKey = format(currentDate, 'yyyy-MM');
  const FIXED_HOLIDAYS = {
    '01-01': 'New Year\'s Day',
    '02-14': 'Valentine\'s Day',
    '03-08': 'Women\'s Day',
    '04-22': 'Earth Day',
    '06-21': 'Summer Solstice',
    '08-15': 'Independence Day',
    '10-31': 'Halloween',
    '12-25': 'Christmas Day'
  };

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

  useEffect(() => {
    try {
      const raw = localStorage.getItem('chronocanvas_custom_holidays');
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const normalized = parsed
          .filter(item => item && typeof item.date === 'string' && typeof item.name === 'string')
          .map(item => ({ date: item.date, name: item.name.trim() }))
          .filter(item => item.name.length > 0);
        setCustomHolidays(normalized);
      }
    } catch {
      setCustomHolidays([]);
    }
  }, []);

  const hasNoteForDate = (date) => {
    const specificDateKey = `notes_${format(date, 'yyyy-MM-dd')}`;
    return !!dots[specificDateKey] || !!dots[`notes_${format(date, 'yyyy-MM-dd')}_to_${format(date, 'yyyy-MM-dd')}`];
  };

  const hasNoteInSelection = (day) => {
    // If it falls in a saved range... for performance just checking if it is exactly a saved range or date.
    return hasNoteForDate(day);
  };

  const handleNextMonth = () => {
    setNavDirection(1);
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handlePrevMonth = () => {
    setNavDirection(-1);
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleYearChange = (e) => {
    const nextYear = parseInt(e.target.value);
    setNavDirection(nextYear >= currentYear ? 1 : -1);
    setCurrentDate(setYear(currentDate, nextYear));
  };

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

  const isRangeMiddle = (day) => {
    if (!startDate || !endDate) return false;
    return isInRange(day) && !isSameDay(day, startDate) && !isSameDay(day, endDate);
  };

  const getHolidayLabel = (day) => {
    const annualKey = format(day, 'MM-dd');
    const fixedLabel = FIXED_HOLIDAYS[annualKey];
    if (fixedLabel) return fixedLabel;

    const exactDate = format(day, 'yyyy-MM-dd');
    const custom = customHolidays.find(item => item.date === exactDate);
    return custom?.name || null;
  };

  const flipVariants = {
    enter: (direction) => ({
      opacity: 0,
      rotateX: direction > 0 ? -14 : 14,
      y: direction > 0 ? 10 : -10,
      filter: 'blur(1px)'
    }),
    center: {
      opacity: 1,
      rotateX: 0,
      y: 0,
      filter: 'blur(0px)'
    },
    exit: (direction) => ({
      opacity: 0,
      rotateX: direction > 0 ? 12 : -12,
      y: direction > 0 ? -8 : 8,
      filter: 'blur(0.8px)'
    })
  };

  return (
    <div 
      className="w-full bg-[#fbf9f4]/95 dark:bg-slate-800/90 p-4 sm:p-6 md:p-7 rounded-b-[1.8rem] lg:rounded-bl-[1.8rem] lg:rounded-br-none h-full flex flex-col transition-colors border-t border-[#e8e0d1]/80 dark:border-slate-700/60"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex justify-between items-center mb-5 sm:mb-6">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <h2 className="month-mark text-2xl sm:text-[2rem] font-semibold text-[color:var(--ink-900)] dark:text-slate-100">
            {format(currentDate, 'MMMM')}
          </h2>
          <div className="relative">
            <select 
              value={currentDate.getFullYear()} 
              onChange={handleYearChange}
              className="appearance-none bg-[#ede6d9] dark:bg-slate-700/80 text-[color:var(--ink-900)] dark:text-slate-100 py-1.5 pl-3 pr-8 rounded-xl font-semibold text-base sm:text-lg cursor-pointer outline-none focus:ring-2 focus:ring-[color:var(--color-active-500)] transition-colors"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-[color:var(--ink-700)]/80 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        <div className="flex gap-2.5">
          <button 
            onClick={handlePrevMonth}
            className="p-2.5 hover:bg-[#ebe5d8] dark:hover:bg-slate-700 rounded-full transition-colors group"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-5 h-5 text-[color:var(--ink-700)] dark:text-slate-300 group-hover:text-[color:var(--color-active-600)]" />
          </button>
          <button 
            onClick={handleNextMonth}
            className="p-2.5 hover:bg-[#ebe5d8] dark:hover:bg-slate-700 rounded-full transition-colors group"
            aria-label="Next Month"
          >
            <ChevronRight className="w-5 h-5 text-[color:var(--ink-700)] dark:text-slate-300 group-hover:text-[color:var(--color-active-600)]" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-[0.45rem] sm:gap-[0.56rem] mb-2.5">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-[11px] sm:text-xs font-semibold text-[color:var(--ink-700)]/60 dark:text-slate-400 py-1.5 uppercase tracking-[0.16em]">
            {day}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false} custom={navDirection}>
        <motion.div
          custom={navDirection}
          key={monthKey}
          className="calendar-page-frame calendar-grid-organic grid grid-cols-7 flex-grow auto-rows-fr"
          variants={flipVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.34, ease: [0.22, 0.62, 0.2, 1] }}
        >
          {days.map((day) => {
            const isSelectedStart = startDate && isSameDay(day, startDate);
            const isSelectedEnd = endDate && isSameDay(day, endDate);
            const highlighted = isInRange(day);
            const middleRange = isRangeMiddle(day);
            const shadowHovered = isHoverRange(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const weekend = isWeekend(day);
            const hasNotes = hasNoteInSelection(day);
            const holidayLabel = isCurrentMonth ? getHolidayLabel(day) : null;
            const hasHoliday = !!holidayLabel;

            return (
              <motion.button
                key={day.toISOString()}
                onMouseDown={() => handleMouseDown(day)}
                onMouseEnter={() => handleMouseEnter(day)}
                onClick={() => handleMouseClick(day)}
                disabled={!isCurrentMonth}
                whileTap={{
                  scale: 0.94,
                  transition: { type: 'spring', stiffness: 420, damping: 18, mass: 0.22 }
                }}
                className={cn(
                  'day-cell relative flex items-center justify-center text-sm sm:text-base font-semibold transition-all duration-200 border border-transparent outline-none overflow-hidden select-none',
                  !isCurrentMonth && 'text-slate-300/80 dark:text-slate-700 pointer-events-none',
                  isCurrentMonth && 'text-[color:var(--ink-900)] dark:text-slate-200 hover:scale-[1.03] hover:shadow-[0_8px_18px_rgba(34,52,62,0.12)]',
                  isCurrentMonth && weekend && !highlighted && !shadowHovered && 'text-[color:var(--color-active-700)]/85',
                  hasHoliday && !highlighted && !shadowHovered && 'bg-[color:var(--color-active-50)]/45 rounded-2xl',
                  shadowHovered && !highlighted && 'bg-[color:var(--color-active-50)]/80 dark:bg-[color:var(--color-active-500)]/15 text-[color:var(--color-active-700)] rounded-2xl',
                  middleRange && 'ink-reveal bg-gradient-to-r from-[color:var(--color-active-100)] to-[color:var(--color-active-50)] dark:from-[color:var(--color-active-600)]/35 dark:to-[color:var(--color-active-500)]/20 rounded-none',
                  isSelectedStart && 'bg-[color:var(--color-active-600)] text-white rounded-full shadow-[0_10px_24px_color-mix(in_srgb,var(--color-active-700)_38%,transparent)]',
                  isSelectedEnd && 'bg-[color:var(--color-active-600)] text-white rounded-full shadow-[0_10px_24px_color-mix(in_srgb,var(--color-active-700)_38%,transparent)]',
                  highlighted && !middleRange && !isSelectedStart && !isSelectedEnd && 'bg-[color:var(--color-active-100)]/80 dark:bg-[color:var(--color-active-600)]/25 text-[color:var(--color-active-700)] rounded-2xl',
                  highlighted && isSelectedStart && !isSelectedEnd && endDate && 'rounded-r-2xl',
                  highlighted && isSelectedEnd && !isSelectedStart && startDate && 'rounded-l-2xl'
                )}
              >
                {isToday(day) && !isSelectedStart && !isSelectedEnd && !highlighted && (
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-[color:var(--color-active-500)] opacity-35" />
                )}

                {hasHoliday && (
                  <div
                    className="holiday-pin absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[color:var(--color-active-600)]"
                    title={holidayLabel}
                    aria-label={holidayLabel}
                  />
                )}
                {format(day, 'd')}

                {hasNotes && (
                  <div className={cn(
                    'absolute bottom-1.5 w-1.5 h-1.5 rounded-full transition-colors',
                    (isSelectedStart || isSelectedEnd) ? 'bg-white' : 'bg-[color:var(--color-active-600)]'
                  )} />
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
