import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { HeroSection } from './HeroSection';
import { CalendarGrid } from './CalendarGrid';
import { NotesPanel } from './NotesPanel';
import { Header } from './Header';

export function WallCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const calendarRef = useRef(null);

  const handleJumpToToday = () => {
    const today = new Date();
    setCurrentDate(today);
  };

  const handleClearSelection = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const handleExportImage = async () => {
    if (!calendarRef.current) return;
    try {
      const canvas = await html2canvas(calendarRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `ChronoCanvas-${currentDate.getFullYear()}-${currentDate.getMonth() + 1}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export calendar', err);
    }
  };

  const getSeasonInfo = (date) => {
    const month = date.getMonth();
    if (month === 11 || month === 0 || month === 1) return 'winter';
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    return 'autumn';
  };

  const currentSeason = getSeasonInfo(currentDate);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
      
      <div className="w-full max-w-5xl px-4">
        <Header 
          onJumpToToday={handleJumpToToday}
          onClearSelection={handleClearSelection}
          onExportImage={handleExportImage}
          hasSelection={!!startDate}
        />
      </div>

      <div 
        ref={calendarRef} 
        data-season={currentSeason}
        className="w-full flex flex-col p-4 sm:p-2 lg:p-0"
      >
        {/* Wall Hanger element */}
        <div className="flex justify-center mb-4 select-none drop-shadow-md">
          <div className="w-32 h-4 sm:h-6 bg-slate-300 dark:bg-slate-600 rounded-full flex justify-between items-center px-4 relative before:content-[''] before:absolute before:w-1.5 before:h-1.5 before:bg-slate-500 dark:before:bg-slate-800 before:rounded-full before:left-3 after:content-[''] after:absolute after:w-1.5 after:h-1.5 after:bg-slate-500 dark:after:bg-slate-800 after:rounded-full after:right-3 transition-colors">
              <div className="w-16 h-8 border-2 border-slate-300 dark:border-slate-600 border-b-0 rounded-t-xl absolute -top-[1.125rem] sm:-top-7 left-1/2 -translate-x-1/2 transition-colors"></div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row bg-white dark:bg-slate-800 rounded-2xl shadow-2xl shadow-slate-300/50 dark:shadow-slate-900/80 min-h-[700px] border border-slate-100 dark:border-slate-700/60 overflow-hidden paper-texture transition-colors">
          
          {/* Left Column: Image and Calendar Grid */}
          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-800 transition-colors">
            <HeroSection 
              currentDate={currentDate} 
            />
            <CalendarGrid 
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
            />
          </div>

          {/* Right Column: Notes Block */}
          <NotesPanel 
            currentDate={currentDate}
            startDate={startDate}
            endDate={endDate}
          />
          
        </div>
      </div>
    </div>
  );
}
