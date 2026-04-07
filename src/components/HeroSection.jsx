import React from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';

const MONTH_IMAGES = {
  0: "/winter.png", // Jan
  1: "/winter.png", // Feb
  2: "/spring.png", // Mar
  3: "/spring.png", // Apr
  4: "/spring.png", // May
  5: "/summer.png", // Jun
  6: "/summer.png", // Jul
  7: "/summer.png", // Aug
  8: "/autumn.png", // Sep
  9: "/autumn.png", // Oct
  10: "/autumn.png", // Nov
  11: "/winter.png"  // Dec
};

function sampleMutedPalette(img) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  const sampleSize = 28;
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

  const data = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
  let r = 0;
  let g = 0;
  let b = 0;
  let total = 0;

  for (let i = 0; i < data.length; i += 4) {
    const pr = data[i];
    const pg = data[i + 1];
    const pb = data[i + 2];
    const alpha = data[i + 3] / 255;
    if (alpha < 0.8) continue;

    const luminance = (pr * 0.2126 + pg * 0.7152 + pb * 0.0722) / 255;
    if (luminance < 0.1 || luminance > 0.92) continue;

    r += pr;
    g += pg;
    b += pb;
    total += 1;
  }

  if (!total) return null;

  const baseR = Math.round(r / total);
  const baseG = Math.round(g / total);
  const baseB = Math.round(b / total);

  const tint = (value, amount) => Math.max(0, Math.min(255, Math.round(value + amount)));

  return {
    '--color-active-50': `rgb(${tint(baseR, 112)} ${tint(baseG, 112)} ${tint(baseB, 112)})`,
    '--color-active-100': `rgb(${tint(baseR, 78)} ${tint(baseG, 78)} ${tint(baseB, 78)})`,
    '--color-active-500': `rgb(${tint(baseR, -6)} ${tint(baseG, -6)} ${tint(baseB, -6)})`,
    '--color-active-600': `rgb(${tint(baseR, -26)} ${tint(baseG, -26)} ${tint(baseB, -26)})`,
    '--color-active-700': `rgb(${tint(baseR, -44)} ${tint(baseG, -44)} ${tint(baseB, -44)})`
  };
}

export function HeroSection({ currentDate, onPaletteExtract }) {
  const monthIndex = currentDate.getMonth();
  const imageUrl = MONTH_IMAGES[monthIndex];

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);

  const smoothX = useSpring(pointerX, { stiffness: 120, damping: 20, mass: 0.25 });
  const smoothY = useSpring(pointerY, { stiffness: 120, damping: 20, mass: 0.25 });

  const overlayX = useTransform(smoothX, [0, 1], [-4, 4]);
  const overlayY = useTransform(smoothY, [0, 1], [-3, 3]);
  const panelX = useTransform(smoothX, [0, 1], [-7, 7]);
  const panelY = useTransform(smoothY, [0, 1], [-5, 5]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nextX = (e.clientX - rect.left) / rect.width;
    const nextY = (e.clientY - rect.top) / rect.height;
    pointerX.set(Math.max(0, Math.min(1, nextX)));
    pointerY.set(Math.max(0, Math.min(1, nextY)));
  };

  const handleMouseLeave = () => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  };

  const handleImageLoad = (e) => {
    if (!onPaletteExtract) return;
    const palette = sampleMutedPalette(e.currentTarget);
    if (palette) onPaletteExtract(palette);
  };

  return (
    <div
      className="group relative w-full h-[270px] sm:h-[330px] md:h-[410px] overflow-hidden rounded-t-[1.8rem] lg:rounded-tl-[1.8rem] lg:rounded-tr-none bg-[#d8d1c4]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={imageUrl}
          src={imageUrl}
          alt={`Scene for ${format(currentDate, 'MMMM')}`}
          className="absolute inset-0 w-full h-full object-cover"
          onLoad={handleImageLoad}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.03, y: -3 }}
          exit={{ opacity: 0.15, scale: 0.98 }}
          transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/58 via-black/18 to-black/8" />
      <motion.div className="absolute inset-0 bg-gradient-to-br from-white/18 via-transparent to-transparent mix-blend-screen" style={{ x: overlayX, y: overlayY }} />
      <motion.div className="absolute -left-10 bottom-14 h-40 w-44 rounded-full bg-[color:var(--color-active-100)]/30 blur-3xl" style={{ x: panelX, y: panelY }} />

      <motion.div
        className="absolute left-5 right-auto top-5 sm:left-8 sm:top-7 px-4 py-2.5 rounded-2xl border border-white/35 bg-white/18 text-white/85 text-xs sm:text-sm backdrop-blur-md"
        style={{ x: overlayX, y: overlayY }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        Printed moodboard edition
      </motion.div>

      <motion.div className="absolute bottom-5 left-5 sm:bottom-7 sm:left-8 text-white drop-shadow-md" style={{ x: overlayX, y: panelY }}>
        <motion.h1 
          className="month-mark text-5xl sm:text-6xl font-semibold tracking-tight leading-[0.9]"
          key={`month-${monthIndex}`}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {format(currentDate, 'MMMM')}
        </motion.h1>
        <motion.p 
          className="text-lg sm:text-2xl font-medium text-white/82 mt-1"
          key={`year-${currentDate.getFullYear()}`}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {format(currentDate, 'yyyy')}
        </motion.p>
      </motion.div>

      <motion.div
        className="absolute bottom-6 right-5 sm:right-8 h-20 w-24 sm:h-24 sm:w-28 rounded-[1.2rem] border border-white/35 bg-white/20 backdrop-blur-md shadow-[0_10px_25px_rgba(0,0,0,0.2)] rotate-[3deg] flex items-center justify-center text-white/90"
        style={{ x: panelX, y: overlayY }}
      >
        <div className="text-center">
          <div className="text-[11px] uppercase tracking-[0.16em] opacity-80">Daylight</div>
          <div className="month-mark text-2xl sm:text-3xl leading-none">{format(currentDate, 'd')}</div>
        </div>
      </motion.div>
    </div>
  );
}
