import React from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';

const MONTH_IMAGES = {
  0: "/jan.png",
  1: "/feb.png",
  2: "/mar.png",
  3: "/apr.png",
  4: "/may.png",
  5: "/jun.png",
  6: "/jul.png",
  7: "/aug.png",
  8: "/sep.png",
  9: "/oct.png",
  10: "/nov.png",
  11: "/dec.png"
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
      className="group relative w-full h-[218px] sm:h-[258px] overflow-hidden bg-[#d8d1c4]"
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

      <div className="absolute inset-0 bg-gradient-to-t from-[#2f3f58]/42 via-[#3c4f70]/10 to-transparent" />
      <motion.div className="absolute inset-0 bg-gradient-to-br from-white/18 via-transparent to-transparent mix-blend-screen" style={{ x: overlayX, y: overlayY }} />
      <motion.div className="absolute -left-10 bottom-14 h-40 w-44 rounded-full bg-[color:var(--color-active-100)]/30 blur-3xl" style={{ x: panelX, y: panelY }} />

      <motion.div className="absolute bottom-11 left-8 sm:bottom-12 sm:left-10 text-white drop-shadow-md" style={{ x: overlayX, y: panelY }}>
        <motion.h1 
          className="month-script text-4xl sm:text-5xl font-normal tracking-tight leading-[0.9]"
          key={`month-${monthIndex}`}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {format(currentDate, 'MMMM')}
        </motion.h1>
        <motion.p 
          className="text-sm sm:text-base tracking-[0.24em] uppercase font-medium text-white/82 mt-0.5 ml-2"
          key={`year-${currentDate.getFullYear()}`}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {format(currentDate, 'yyyy')}
        </motion.p>
      </motion.div>
    </div>
  );
}
