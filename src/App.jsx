import React, { useState, useEffect } from 'react';
import { WallCalendar } from './components/WallCalendar';

export const ThemeContext = React.createContext({});

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || false;
  });

  const [activeThemeColor, setActiveThemeColor] = useState('blue'); // default winter

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, activeThemeColor, setActiveThemeColor }}>
      <div className="atmosphere min-h-screen flex items-start justify-center p-3 sm:p-6 lg:p-10 selection:bg-[color:var(--color-active-100)] selection:text-[color:var(--ink-900)] transition-colors duration-300">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-24 top-28 h-56 w-56 rounded-full bg-[color:var(--color-active-100)]/50 blur-3xl" />
          <div className="absolute right-6 top-12 h-72 w-72 rounded-full bg-[#d8cdb9]/35 blur-3xl" />
          <div className="absolute bottom-10 left-1/3 h-44 w-44 rounded-full bg-[#a4b5b9]/25 blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-[1180px]">
          <WallCalendar />
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
