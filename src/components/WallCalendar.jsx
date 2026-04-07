import React, { useEffect, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import { HeroSection } from './HeroSection';
import { CalendarGrid } from './CalendarGrid';
import { NotesPanel } from './NotesPanel';
import { ExperienceDock } from './ExperienceDock';
import CalendarHeader from './CalendarHeader';

const MONTH_IMAGES = {
  0: '/jan.png',
  1: '/feb.png',
  2: '/mar.png',
  3: '/apr.png',
  4: '/may.png',
  5: '/jun.png',
  6: '/jul.png',
  7: '/aug.png',
  8: '/sep.png',
  9: '/oct.png',
  10: '/nov.png',
  11: '/dec.png'
};

export function WallCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [imagePalette, setImagePalette] = useState(null);
  const [moodPalette, setMoodPalette] = useState(null);
  const [visualPreset, setVisualPreset] = useState('detailed');
  const [disablePastDates, setDisablePastDates] = useState(false);
  const [disableFutureDates, setDisableFutureDates] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const calendarRef = useRef(null);
  const moodResetRef = useRef(null);

  const handleJumpToToday = () => {
    const today = new Date();
    setCurrentDate(today);
  };

  const handleClearSelection = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const rotateVisualPreset = () => {
    setVisualPreset((prev) => (prev === 'detailed' ? 'minimal' : 'detailed'));
  };

  const applyTemporaryMoodPalette = () => {
    if (moodPalette) {
      setMoodPalette(null);
      if (moodResetRef.current) {
        clearTimeout(moodResetRef.current);
        moodResetRef.current = null;
      }
      return;
    }

    const moods = [
      {
        '--color-active-50': '#eceff6',
        '--color-active-100': '#dbe3f0',
        '--color-active-500': '#7a8fb0',
        '--color-active-600': '#62789b',
        '--color-active-700': '#4d607f'
      },
      {
        '--color-active-50': '#f6efe8',
        '--color-active-100': '#ead9ca',
        '--color-active-500': '#b18a67',
        '--color-active-600': '#997252',
        '--color-active-700': '#7f5c40'
      },
      {
        '--color-active-50': '#f3ecef',
        '--color-active-100': '#e8d9df',
        '--color-active-500': '#ac7f8f',
        '--color-active-600': '#936777',
        '--color-active-700': '#784f5f'
      }
    ];

    const selected = moods[Math.floor(Math.random() * moods.length)];
    setMoodPalette(selected);

    if (moodResetRef.current) clearTimeout(moodResetRef.current);
    moodResetRef.current = setTimeout(() => {
      setMoodPalette(null);
      moodResetRef.current = null;
    }, 12000);
  };

  useEffect(() => {
    return () => {
      if (moodResetRef.current) clearTimeout(moodResetRef.current);
    };
  }, []);

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
        data-visual-preset={visualPreset}
        data-mood-active={!!moodPalette}
        style={{ ...(imagePalette || {}), ...(moodPalette || {}) }}
        className="calendar-sheet-wrapper w-full"
      >
        <div className="calendar-sheet w-full flex flex-col">
        <CalendarHeader />

        <div className="sheet-panel overflow-hidden rounded-b-[8px] rounded-t-[0px] border border-[#cfc7be] border-t-0 dark:border-slate-700 bg-[#f6f2ee] dark:bg-slate-800">

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
        visualPreset={visualPreset}
        onRotateVisualPreset={rotateVisualPreset}
        onApplyMoodPalette={applyTemporaryMoodPalette}
        moodActive={!!moodPalette}
      />
    </div>
  );
}
