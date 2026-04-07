import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import { HeroSection } from './HeroSection';
import { CalendarGrid } from './CalendarGrid';
import { NotesPanel } from './NotesPanel';
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

  const createCalendarPng = async (backgroundColor = '#f4f0ea') => {
    if (!calendarRef.current) return null;

    return toPng(calendarRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor,
      skipFonts: true,
      filter: (node) => {
        const tag = node?.tagName;
        return tag !== 'SCRIPT' && tag !== 'STYLE';
      }
    });
  };

  const handleExportImage = async () => {
    if (!calendarRef.current) return false;
    try {
      const dataUrl = await createCalendarPng('#f4f0ea');
      if (!dataUrl) return false;
      const link = document.createElement('a');
      link.download = `ChronoCanvas-${currentDate.getFullYear()}-${currentDate.getMonth() + 1}.png`;
      link.href = dataUrl;
      link.click();
      return true;
    } catch (err) {
      console.error('Failed to export calendar', err);
      return false;
    }
  };

  const handleExportPdf = async () => {
    if (!calendarRef.current) return false;
    try {
      const imageData = await createCalendarPng('#ffffff');
      if (!imageData) return false;

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const usableWidth = pageWidth - margin * 2;
      const image = new Image();
      image.src = imageData;
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });

      const computedHeight = (image.height * usableWidth) / image.width;
      const usableHeight = Math.min(computedHeight, pageHeight - margin * 2);

      pdf.addImage(imageData, 'PNG', margin, margin, usableWidth, usableHeight, undefined, 'FAST');
      pdf.save(`ChronoCanvas-${currentDate.getFullYear()}-${currentDate.getMonth() + 1}.pdf`);
      return true;
    } catch (err) {
      console.error('Failed to prepare PDF print view', err);
      return false;
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

          <div className="h-28 sm:h-32 border-t border-[#d8d0c7] dark:border-slate-700/60 bg-cover bg-center" style={{ backgroundImage: `url(${MONTH_IMAGES[currentDate.getMonth()]})` }} />
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
