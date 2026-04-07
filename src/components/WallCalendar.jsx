import React, { useState, useRef, useContext } from 'react';
import html2canvas from 'html2canvas';
import { HeroSection } from './HeroSection';
import { CalendarGrid } from './CalendarGrid';
import { NotesPanel } from './NotesPanel';
import { Camera, Moon, Search, Sun } from 'lucide-react';
import { ThemeContext } from '../App';
import { ExperienceDock } from './ExperienceDock';

const MONTH_IMAGES = {
  0: '/winter.png',
  1: '/winter.png',
  2: '/spring.png',
  3: '/spring.png',
  4: '/spring.png',
  5: '/summer.png',
  6: '/summer.png',
  7: '/summer.png',
  8: '/autumn.png',
  9: '/autumn.png',
  10: '/autumn.png',
  11: '/winter.png'
};

export function WallCalendar() {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [imagePalette, setImagePalette] = useState(null);
  const [disablePastDates, setDisablePastDates] = useState(false);
  const [disableFutureDates, setDisableFutureDates] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
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

  const handleExportPdf = async () => {
    if (!calendarRef.current) return;
    try {
      const canvas = await html2canvas(calendarRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const dataUrl = canvas.toDataURL('image/png');
      const popup = window.open('', '_blank');
      if (!popup) return;

      popup.document.write(`
        <html><head><title>ChronoCanvas PDF</title></head>
        <body style="margin:0;display:flex;justify-content:center;align-items:flex-start;background:#fff;">
          <img src="${dataUrl}" style="max-width:100%;height:auto;" />
          <script>window.onload = () => { window.print(); };</script>
        </body></html>
      `);
      popup.document.close();
    } catch (err) {
      console.error('Failed to prepare PDF print view', err);
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
    <div className="w-full mx-auto flex flex-col xl:flex-row items-start justify-center gap-4 xl:gap-6">
      <div 
        ref={calendarRef} 
        data-season={currentSeason}
        style={imagePalette || undefined}
        className="calendar-sheet-wrapper w-full"
      >
        <div className="side-actions" aria-label="Quick actions">
          <button onClick={toggleDarkMode} className="side-action-btn" aria-label="Toggle theme">
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={handleExportImage} className="side-action-btn" aria-label="Export image">
            <Camera className="w-4 h-4" />
          </button>
          <button className="side-action-btn" aria-label="Search">
            <Search className="w-4 h-4" />
          </button>
        </div>

        <div className="calendar-sheet w-full flex flex-col">
        <div className="spiral-wrap">
          <div className="spiral-hook" />
          <div className="spiral-line" />
          <div className="spiral-rings" />
        </div>

        <div className="sheet-panel overflow-hidden rounded-b-[8px] rounded-t-[3px] border border-[#cfc7be] dark:border-slate-700 bg-[#f6f2ee] dark:bg-slate-800">
          <div className="sheet-topbar px-4 sm:px-6 h-11 flex items-center justify-between border-b border-[#dfd7cd] dark:border-slate-700/80 bg-[#f5f1ec] dark:bg-slate-800/95">
            <div className="sheet-brand dark:text-slate-100">ChronoCanvas</div>
            <div className="w-8" />
          </div>

          <div className="flex flex-col bg-[#f7f3ee] dark:bg-slate-800">
            <HeroSection 
              currentDate={currentDate} 
              onPaletteExtract={setImagePalette}
            />

            <div className="grid lg:grid-cols-[1fr_230px] gap-0 px-4 sm:px-5 py-3.5 sm:py-4.5">
              <CalendarGrid 
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                onJumpToToday={handleJumpToToday}
                onClearSelection={handleClearSelection}
                hasSelection={!!startDate}
                disablePastDates={disablePastDates}
                disableFutureDates={disableFutureDates}
                compactMode={compactMode}
              />

              <NotesPanel 
                currentDate={currentDate}
                startDate={startDate}
                endDate={endDate}
              />
            </div>
          </div>

          <div className="h-24 sm:h-28 border-t border-[#d8d0c7] dark:border-slate-700/60 bg-cover bg-center" style={{ backgroundImage: `url(${MONTH_IMAGES[currentDate.getMonth()]})` }} />
        </div>
        </div>
      </div>

      <ExperienceDock
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        disablePastDates={disablePastDates}
        setDisablePastDates={setDisablePastDates}
        disableFutureDates={disableFutureDates}
        setDisableFutureDates={setDisableFutureDates}
        compactMode={compactMode}
        setCompactMode={setCompactMode}
        onJumpToToday={handleJumpToToday}
        onClearSelection={handleClearSelection}
        onExportImage={handleExportImage}
        onExportPdf={handleExportPdf}
      />
    </div>
  );
}
