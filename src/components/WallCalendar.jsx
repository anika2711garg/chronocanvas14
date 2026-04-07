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
  const [imagePalette, setImagePalette] = useState(null);
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
    <div className="w-full mx-auto flex flex-col items-center">
      
      <div className="w-full px-2 sm:px-4">
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
        style={imagePalette || undefined}
        className="calendar-shell w-full flex flex-col p-1 sm:p-2 lg:p-0"
      >
        {/* Wall Hanger element */}
        <div className="flex justify-center mb-3 sm:mb-4 select-none drop-shadow-md">
          <div className="w-34 h-4 sm:h-6 bg-[#bbb2a2] dark:bg-[#4a4340] rounded-full flex justify-between items-center px-4 relative before:content-[''] before:absolute before:w-1.5 before:h-1.5 before:bg-[#6b6256] dark:before:bg-[#1f1b19] before:rounded-full before:left-3 after:content-[''] after:absolute after:w-1.5 after:h-1.5 after:bg-[#6b6256] dark:after:bg-[#1f1b19] after:rounded-full after:right-3 transition-colors">
              <div className="w-16 h-8 border-2 border-[#c4bbab] dark:border-[#4f4743] border-b-0 rounded-t-xl absolute -top-[1.125rem] sm:-top-7 left-[48%] -translate-x-1/2 transition-colors"></div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row bg-white/85 dark:bg-slate-800/85 rounded-[1.8rem] shadow-[0_24px_50px_rgba(27,40,48,0.18)] dark:shadow-[0_24px_50px_rgba(0,0,0,0.5)] min-h-[700px] border border-white/70 dark:border-slate-700/70 overflow-hidden paper-texture backdrop-blur-sm transition-colors">
          
          {/* Left Column: Image and Calendar Grid */}
          <div className="flex-1 flex flex-col min-w-0 bg-white/70 dark:bg-slate-800/80 transition-colors">
            <HeroSection 
              currentDate={currentDate} 
              onPaletteExtract={setImagePalette}
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
