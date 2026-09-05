import React, { useState, useEffect } from 'react';
import { soundEffects } from '../../utils/soundEffects';

type FontSizeLevel = 'normal' | 'large' | 'xlarge';

export const AccessibilityFontScaler: React.FC = () => {
  const [level, setLevel] = useState<FontSizeLevel>('normal');

  useEffect(() => {
    const saved = localStorage.getItem('vitalsalud_font_scale') as FontSizeLevel;
    if (saved) {
      applyScale(saved);
      setLevel(saved);
    }
  }, []);

  const applyScale = (newLevel: FontSizeLevel) => {
    const root = document.documentElement;
    if (newLevel === 'large') {
      root.style.fontSize = '16.5px';
    } else if (newLevel === 'xlarge') {
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '14.5px';
    }
    localStorage.setItem('vitalsalud_font_scale', newLevel);
  };

  const handleSelect = (newLevel: FontSizeLevel) => {
    soundEffects.playPop();
    setLevel(newLevel);
    applyScale(newLevel);
  };

  return (
    <div
      className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700"
      title="Ajustar tamaño de fuente del sistema"
    >
      <button
        type="button"
        onClick={() => handleSelect('normal')}
        className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
          level === 'normal'
            ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-300 shadow-sm font-bold'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        A
      </button>
      <button
        type="button"
        onClick={() => handleSelect('large')}
        className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${
          level === 'large'
            ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-300 shadow-sm font-bold'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        A+
      </button>
      <button
        type="button"
        onClick={() => handleSelect('xlarge')}
        className={`px-2 py-1 text-xs font-black rounded-md transition-all ${
          level === 'xlarge'
            ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-300 shadow-sm font-bold'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        A++
      </button>
    </div>
  );
};
