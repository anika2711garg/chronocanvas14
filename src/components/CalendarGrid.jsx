import React, { useState, useEffect, useRef } from 'react';
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, format, isSameMonth, isSameDay, 
  isAfter, isBefore, addMonths, subMonths,
  setYear, startOfDay
} from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronDown, Home, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function CalendarGrid({ 
  currentDate, setCurrentDate, 
  startDate, setStartDate, 
  endDate, setEndDate,
  onJumpToToday,
  onClearSelection,
  hasSelection,
  disablePastDates,
  disableFutureDates,
  compactMode
}) {
  const [hoverDate, setHoverDate] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [noteMetaByDate, setNoteMetaByDate] = useState({});
  const [customHolidays, setCustomHolidays] = useState([]);
  const [navDirection, setNavDirection] = useState(1);
  const [hoveredHolidayIso, setHoveredHolidayIso] = useState(null);
  const [hoveredNoteIso, setHoveredNoteIso] = useState(null);
  const lastWheelRef = useRef(0);

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
    '05-01': 'Labour Day',
    '06-21': 'Summer Solstice',
    '07-07': 'Monsoon Festival',
    '08-15': 'Independence Day',
    '09-21': 'Peace Day',
    '10-31': 'Halloween',
    '11-14': 'Kindness Day',
    '12-25': 'Christmas Day'
  };

  // Sync note markers, snippets, and density from localStorage
  useEffect(() => {
    const nextMeta = {};

    const upsert = (dateKey, snippet, count) => {
      if (!dateKey) return;
      const existing = nextMeta[dateKey] || { count: 0, snippet: '' };
      nextMeta[dateKey] = {
        count: existing.count + count,
        snippet: existing.snippet || snippet || ''
      };
    };

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      if (key.startsWith('notes_list_notes_')) {
        try {
          const dateKey = key.replace('notes_list_notes_', '');
          const parsed = JSON.parse(localStorage.getItem(key));
          if (Array.isArray(parsed) && parsed.length) {
            const firstSnippet = typeof parsed[0]?.text === 'string' ? parsed[0].text : '';
            upsert(dateKey, firstSnippet, parsed.length);
          }
        } catch {
          // ignore malformed storage payloads
        }
      }

      if (key.startsWith('chronocanvas_event_')) {
        try {
          const parsedEvent = JSON.parse(localStorage.getItem(key));
          if (parsedEvent?.date) {
            const eventSnippet = typeof parsedEvent.content === 'string' ? parsedEvent.content : '';
            upsert(parsedEvent.date, eventSnippet, 1);
          }
        } catch {
          // ignore malformed storage payloads
        }
      }
    }

    setNoteMetaByDate(nextMeta);
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
    const dateKey = format(date, 'yyyy-MM-dd');
    return !!noteMetaByDate[dateKey]?.count;
  };

  const getNoteSnippet = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return noteMetaByDate[dateKey]?.snippet || '';
  };

  const getNoteDensity = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const count = noteMetaByDate[dateKey]?.count || 0;
    return Math.min(count, 4);
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

  const handleCalendarWheel = (event) => {
    const now = Date.now();
    if (now - lastWheelRef.current < 260) return;
    if (Math.abs(event.deltaY) < 16) return;

    lastWheelRef.current = now;
    if (event.deltaY > 0) handleNextMonth();
    else handlePrevMonth();
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

  const handleCellMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const offsetX = ((x - cx) / cx) * 2.4;
    const offsetY = ((y - cy) / cy) * 2;

    event.currentTarget.style.setProperty('--mag-x', `${offsetX.toFixed(2)}px`);
    event.currentTarget.style.setProperty('--mag-y', `${offsetY.toFixed(2)}px`);
  };

  const handleCellMouseLeave = (event) => {
    event.currentTarget.style.setProperty('--mag-x', '0px');
    event.currentTarget.style.setProperty('--mag-y', '0px');
    setHoveredNoteIso(null);
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

  const isDateBlocked = (day) => {
    const today = startOfDay(new Date());
    const normalizedDay = startOfDay(day);
    if (disablePastDates && isBefore(normalizedDay, today)) return true;
    if (disableFutureDates && isAfter(normalizedDay, today)) return true;
    return false;
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
      rotateX: direction > 0 ? -26 : 26,
      rotateY: direction > 0 ? 6 : -6,
      scale: 0.96,
      y: direction > 0 ? 18 : -18,
      transformOrigin: direction > 0 ? '50% 0%' : '50% 100%',
      filter: 'blur(1.2px)'
    }),
    center: {
      opacity: 1,
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      y: 0,
      transformOrigin: '50% 50%',
      filter: 'blur(0px)'
    },
    exit: (direction) => ({
      opacity: 0,
      rotateX: direction > 0 ? 22 : -22,
      rotateY: direction > 0 ? -4 : 4,
      scale: 0.98,
      y: direction > 0 ? -14 : 14,
      transformOrigin: direction > 0 ? '50% 100%' : '50% 0%',
      filter: 'blur(0.8px)'
    })
  };

  return (
    <div 
      className="w-full bg-transparent p-0 h-full flex flex-col"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleCalendarWheel}
      onDoubleClick={() => onJumpToToday && onJumpToToday()}
    >
      <div className="flex items-center gap-2 mb-3 text-[#5c5f66] dark:text-slate-200">
        <button onClick={handlePrevMonth} className="sheet-nav-btn" aria-label="Previous month">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="relative">
          <select
            value={currentDate.getFullYear()}
            onChange={handleYearChange}
            className="sheet-select appearance-none"
          >
            {years.map(y => <option key={y} value={y}>{format(currentDate, 'MMMM')} {y}</option>)}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#7a7f88] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <button onClick={handleNextMonth} className="sheet-nav-btn" aria-label="Next month">
          <ChevronRight className="w-4 h-4" />
        </button>
        <button onClick={() => onJumpToToday && onJumpToToday()} className="sheet-today-btn ml-auto">
          <Home className="w-3.5 h-3.5" />
          Today
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-[10px] sm:text-[11px] font-semibold text-[#70747d] dark:text-slate-400 py-1 uppercase tracking-[0.2em]">
            {day.slice(0, 1)}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false} custom={navDirection}>
        <motion.div
          custom={navDirection}
          key={monthKey}
          className="calendar-page-frame relative overflow-hidden grid grid-cols-7 gap-1 flex-grow auto-rows-fr"
          variants={flipVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.42, ease: [0.22, 0.62, 0.2, 1] }}
        >
          <motion.div
            className="flip-paper-sweep pointer-events-none absolute inset-y-0 -left-[40%] w-[45%] z-[1]"
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: '360%', opacity: [0, 1, 0] }}
            transition={{ duration: 0.58, ease: [0.2, 0.7, 0.2, 1] }}
          />

          {days.map((day) => {
            const isSelectedStart = startDate && isSameDay(day, startDate);
            const isSelectedEnd = endDate && isSameDay(day, endDate);
            const highlighted = isInRange(day);
            const middleRange = isRangeMiddle(day);
            const shadowHovered = isHoverRange(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const hasNotes = hasNoteInSelection(day);
            const holidayLabel = isCurrentMonth ? getHolidayLabel(day) : null;
            const hasHoliday = !!holidayLabel;
            const holidayIso = format(day, 'yyyy-MM-dd');
            const showHolidayTooltip = hasHoliday && hoveredHolidayIso === holidayIso;
            const blocked = isCurrentMonth && isDateBlocked(day);
            const noteSnippet = getNoteSnippet(day);
            const noteDensity = getNoteDensity(day);
            const showNotePreview = isCurrentMonth && hoveredNoteIso === holidayIso && !!noteSnippet;

            return (
              <motion.button
                key={day.toISOString()}
                onMouseDown={() => handleMouseDown(day)}
                onMouseEnter={() => {
                  handleMouseEnter(day);
                  setHoveredNoteIso(format(day, 'yyyy-MM-dd'));
                }}
                onMouseMove={handleCellMouseMove}
                onMouseLeave={handleCellMouseLeave}
                onClick={() => handleMouseClick(day)}
                disabled={!isCurrentMonth || blocked}
                whileTap={{
                  scale: 0.94,
                  transition: { type: 'spring', stiffness: 420, damping: 18, mass: 0.22 }
                }}
                className={cn(
                  'sheet-day-cell relative flex items-center justify-center text-sm sm:text-[15px] font-medium transition-all duration-200 outline-none overflow-hidden select-none',
                  compactMode && 'sheet-day-cell-compact',
                  !isCurrentMonth && 'text-[#bcc0c7] dark:text-slate-600',
                  blocked && 'opacity-35 cursor-not-allowed',
                  isCurrentMonth && 'text-[#474d57] dark:text-slate-200 hover:bg-[#edf0f3] dark:hover:bg-slate-700/35',
                  noteDensity === 1 && 'note-heat-1',
                  noteDensity === 2 && 'note-heat-2',
                  noteDensity >= 3 && 'note-heat-3',
                  hasHoliday && !highlighted && !shadowHovered && 'bg-[#f0efea] dark:bg-slate-700/25',
                  shadowHovered && !highlighted && 'bg-[#e9edf2] dark:bg-slate-700/45 text-[#2f4358] dark:text-slate-100',
                  middleRange && 'ink-reveal bg-gradient-to-r from-[#dce7f5] to-[#cbd9eb] dark:from-[color:var(--color-active-600)]/35 dark:to-[color:var(--color-active-500)]/20 rounded-[4px]',
                  isSelectedStart && 'bg-[#9eb5d2] text-[#273246] rounded-[4px]',
                  isSelectedEnd && 'bg-[#9eb5d2] text-[#273246] rounded-[4px]',
                  highlighted && !middleRange && !isSelectedStart && !isSelectedEnd && 'bg-[#d6e2f2] text-[#31455b] rounded-[4px]'
                )}
              >
                {hasHoliday && (
                  <div
                    className="holiday-pin absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[color:var(--color-active-600)]"
                    aria-label={holidayLabel}
                    onMouseEnter={() => setHoveredHolidayIso(holidayIso)}
                    onMouseLeave={() => setHoveredHolidayIso(null)}
                  />
                )}

                {showHolidayTooltip && (
                  <motion.div
                    className="holiday-tooltip-card absolute z-20 -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 rounded-xl border border-white/65 dark:border-slate-700/70 bg-white/85 dark:bg-slate-800/88 shadow-[0_10px_24px_rgba(24,36,44,0.22)] whitespace-nowrap"
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.16 }}
                  >
                    <div className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--ink-700)]/70 dark:text-slate-300/70">Holiday</div>
                    <div className="text-[11px] font-semibold text-[color:var(--ink-900)] dark:text-slate-100">{holidayLabel}</div>
                  </motion.div>
                )}

                {showNotePreview && (
                  <motion.div
                    className="note-preview-tooltip absolute z-20 -bottom-11 left-1/2 -translate-x-1/2 px-2.5 py-1.5 rounded-lg whitespace-nowrap"
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                  >
                    {noteSnippet}
                  </motion.div>
                )}

                {format(day, 'd')}

                {hasNotes && !isSameDay(day, new Date()) && (
                  <div className={cn(
                    'absolute bottom-1.5 w-1 h-1 rounded-full transition-colors',
                    (isSelectedStart || isSelectedEnd) ? 'bg-[#1e2f43]' : 'bg-[#7d8fa4]'
                  )} />
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <div className="pt-2.5">
        <button
          onClick={() => onClearSelection && onClearSelection()}
          disabled={!hasSelection}
          className="sheet-clear-btn"
        >
          <XCircle className="w-3.5 h-3.5" />
          Clear Selection
        </button>
      </div>
    </div>
  );
}
