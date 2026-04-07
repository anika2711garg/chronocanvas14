import React from "react";

const CalendarHeader = () => {
  return (
    <div className="w-full flex flex-col items-center relative z-10 -mb-2">

      {/* 🔹 Binding Wire Section */}
      <div className="w-full flex justify-center relative py-4 isolate">
        
        {/* Horizontal rod */}
        {/* We use gradient to give it a metallic cylindrical look */}
        <div className="absolute top-1/2 -translate-y-1/2 w-[92%] h-[4px] bg-gradient-to-b from-slate-200 via-slate-400 to-slate-500 rounded-full shadow-[0_2px_3px_rgba(0,0,0,0.3)] z-0"></div>

        {/* Spiral rings (Twin Loops) */}
        {/* The user snippet did 30 evenly spaced rings. To match the realistic twin loops from their earlier image, we group them closely in pairs. */}
        <div className="flex gap-4 sm:gap-6 z-10 w-[88%] justify-between px-2">
          {Array.from({ length: 14 }).map((_, i) => (
            /* Twin loop pair */
            <div key={i} className="flex gap-1.5 opacity-90">
              <div className="w-[5px] h-[18px] sm:h-[22px] bg-gradient-to-b from-slate-300 via-white to-slate-500 border border-slate-600/30 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.4)]"></div>
              <div className="w-[5px] h-[18px] sm:h-[22px] bg-gradient-to-b from-slate-300 via-white to-slate-500 border border-slate-600/30 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.4)]"></div>
            </div>
          ))}
        </div>

        {/* Center Hook Overlay */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1 flex flex-col items-center z-20">
          <div className="w-12 h-12 border-[3px] border-t-slate-300 border-x-slate-400 border-b-slate-500 rounded-full bg-[#f6f2ee] dark:bg-slate-800 shadow-[0_4px_6px_rgba(0,0,0,0.2)] flex items-center justify-center relative">
            {/* The inner peg/nail hole */}
            <div className="w-4 h-4 bg-gradient-to-br from-slate-600 to-slate-900 rounded-full shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
            </div>
            
            {/* Cutout illusion line matching the rod's position cutting across the hook circle to make it look like half the circle is cut physically */}
            <div className="absolute top-[60%] -left-1 -right-1 h-[4px] bg-[#f6f2ee] dark:bg-slate-800 z-30"></div>
          </div>
        </div>
      </div>

      {/* 🔹 Paper Header */}
      <div className="w-full bg-[#f6f2ee] dark:bg-slate-800 rounded-t-lg shadow-sm pt-5 pb-3 flex justify-center items-center border-b border-[#dfd7cd] dark:border-slate-700/80">
        
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-serif text-[#4d515b] dark:text-slate-100 tracking-wide sheet-brand">
          ChronoCanvas
        </h1>
      </div>
    </div>
  );
};

export default CalendarHeader;
