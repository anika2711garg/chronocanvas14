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

  // Background gradient depending on theme and dark mode
  const bgStyles = isDarkMode
    ? { backgroundImage: 'radial-gradient(circle at center, #334155 1px, transparent 1px)', backgroundSize: '32px 32px' }
    : { backgroundImage: 'radial-gradient(circle at center, #cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, activeThemeColor, setActiveThemeColor }}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 sm:p-8 font-sans selection:bg-blue-300 transition-colors duration-300">
        
        {/* Subtle wallpaper texture */}
        <div 
          className="fixed inset-0 pointer-events-none opacity-40 z-0 bg-cover bg-center transition-opacity" 
          style={bgStyles} 
        />
        
        <div className="relative z-10 w-full">
          <WallCalendar />
        </div>

      </div>
    </ThemeContext.Provider>
  );
}

export default App;
