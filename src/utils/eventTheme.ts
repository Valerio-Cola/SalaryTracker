import React from 'react';
import {
  Briefcase,
  User,
  AlertCircle,
  HeartPulse,
  Sparkles,
  ShoppingBag,
  Users,
  Bookmark,
} from 'lucide-react';
import { BuiltInEventCategory, CustomEventCategory, EventCategory } from '../types';

export interface ColorPreset {
  id: string;
  name: string;
  hex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  badgeClass: string;
  dotClass: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'blue',
    name: 'Blu Oceano',
    hex: '#3b82f6',
    bgClass: 'bg-blue-50 dark:bg-blue-950/40',
    textClass: 'text-blue-900 dark:text-blue-200',
    borderClass: 'border-blue-200 dark:border-blue-800',
    badgeClass: 'bg-blue-100 text-blue-900 dark:bg-blue-900/60 dark:text-blue-200',
    dotClass: 'bg-blue-500',
  },
  {
    id: 'indigo',
    name: 'Indaco Notte',
    hex: '#6366f1',
    bgClass: 'bg-indigo-50 dark:bg-indigo-950/40',
    textClass: 'text-indigo-900 dark:text-indigo-200',
    borderClass: 'border-indigo-200 dark:border-indigo-800',
    badgeClass: 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/60 dark:text-indigo-200',
    dotClass: 'bg-indigo-500',
  },
  {
    id: 'emerald',
    name: 'Smeraldo',
    hex: '#10b981',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    textClass: 'text-emerald-900 dark:text-emerald-200',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
    badgeClass: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  {
    id: 'purple',
    name: 'Viola',
    hex: '#a855f7',
    bgClass: 'bg-purple-50 dark:bg-purple-950/40',
    textClass: 'text-purple-900 dark:text-purple-200',
    borderClass: 'border-purple-200 dark:border-purple-800',
    badgeClass: 'bg-purple-100 text-purple-900 dark:bg-purple-900/60 dark:text-purple-200',
    dotClass: 'bg-purple-500',
  },
  {
    id: 'rose',
    name: 'Rosa Corallo',
    hex: '#f43f5e',
    bgClass: 'bg-rose-50 dark:bg-rose-950/40',
    textClass: 'text-rose-900 dark:text-rose-200',
    borderClass: 'border-rose-200 dark:border-rose-800',
    badgeClass: 'bg-rose-100 text-rose-900 dark:bg-rose-900/60 dark:text-rose-200',
    dotClass: 'bg-rose-500',
  },
  {
    id: 'amber',
    name: 'Ambra Sole',
    hex: '#f59e0b',
    bgClass: 'bg-amber-50 dark:bg-amber-950/40',
    textClass: 'text-amber-900 dark:text-amber-200',
    borderClass: 'border-amber-200 dark:border-amber-800',
    badgeClass: 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200',
    dotClass: 'bg-amber-500',
  },
  {
    id: 'cyan',
    name: 'Ciano Acqua',
    hex: '#06b6d4',
    bgClass: 'bg-cyan-50 dark:bg-cyan-950/40',
    textClass: 'text-cyan-900 dark:text-cyan-200',
    borderClass: 'border-cyan-200 dark:border-cyan-800',
    badgeClass: 'bg-cyan-100 text-cyan-900 dark:bg-cyan-900/60 dark:text-cyan-200',
    dotClass: 'bg-cyan-500',
  },
  {
    id: 'slate',
    name: 'Grigio Neutro',
    hex: '#64748b',
    bgClass: 'bg-slate-50 dark:bg-slate-800/60',
    textClass: 'text-slate-900 dark:text-slate-200',
    borderClass: 'border-slate-200 dark:border-slate-700',
    badgeClass: 'bg-slate-100 text-slate-800 dark:bg-slate-700/80 dark:text-slate-200',
    dotClass: 'bg-slate-500',
  },
];

export const POPULAR_CATEGORY_EMOJIS = [
  '🏋️', '📚', '🚗', '✈️', '🍕', '⚽', '💻', '🎮',
  '🎨', '🌿', '💡', '🛒', '🩺', '🎂', '☕', '💰',
  '🏠', '🎬', '🎯', '🐾', '🚴', '🏖️', '🎁', '📅',
  '⭐', '🔥', '📌', '🛠️', '🎓', '🥊', '🏊', '⛺',
];

export const BUILTIN_CATEGORIES: {
  id: BuiltInEventCategory;
  label: string;
  defaultEmoji: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultColor: string;
}[] = [
  { id: 'lavoro', label: 'Lavoro', defaultEmoji: '💼', icon: Briefcase, defaultColor: 'blue' },
  { id: 'personale', label: 'Personale', defaultEmoji: '👤', icon: User, defaultColor: 'indigo' },
  { id: 'scadenza', label: 'Scadenza', defaultEmoji: '⏰', icon: AlertCircle, defaultColor: 'rose' },
];

/**
 * Converte un colore HEX in stringa rgba(...)
 */
export function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length !== 3 && cleanHex.length !== 6) return `rgba(100, 116, 139, ${alpha})`;
  let r: number, g: number, b: number;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '').trim();
  let r = 0, g = 0, b = 0;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length >= 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }
  return (r * 299 + g * 587 + b * 114) / 1000;
}

export interface ResolvedEventColor {
  hex: string;
  isHex: boolean;
  bg: string;
  text: string;
  border: string;
  badge: string;
  dot: string;
  style?: React.CSSProperties;
  badgeStyle?: React.CSSProperties;
  dotStyle?: React.CSSProperties;
}

/**
 * Risolve lo stile cromatico per un evento o categoria.
 * Supporta sia i nomi preset ('blue', 'purple', ...) che qualsiasi codice HEX ('#ec4899', ...)
 */
export function resolveEventColor(colorInput?: string): ResolvedEventColor {
  const val = (colorInput || 'blue').trim();

  // Verifica se è un preset noto
  const preset = COLOR_PRESETS.find((p) => p.id === val || p.hex.toLowerCase() === val.toLowerCase());
  if (preset) {
    return {
      hex: preset.hex,
      isHex: false,
      bg: preset.bgClass,
      text: preset.textClass,
      border: preset.borderClass,
      badge: preset.badgeClass,
      dot: preset.dotClass,
      dotStyle: { backgroundColor: preset.hex },
    };
  }

  // Se è un HEX custom es. "#ec4899" o "ec4899"
  const hex = val.startsWith('#') ? val : `#${val}`;
  if (/^#[0-9a-fA-F]{3,8}$/.test(hex)) {
    const lum = getLuminance(hex);
    // Determina testo ad alto contrasto per la targhetta badge (scuro per colori chiari/giallo, bianco per scuri)
    const badgeTextColor = lum > 160 ? '#0f172a' : '#ffffff';

    return {
      hex,
      isHex: true,
      bg: 'bg-slate-50/90 dark:bg-slate-900/90',
      text: 'text-slate-900 dark:text-slate-100 font-semibold',
      border: 'border-slate-300 dark:border-slate-700',
      badge: 'font-bold uppercase tracking-wider shadow-2xs',
      dot: '',
      style: {
        backgroundColor: hexToRgba(hex, 0.22),
        borderColor: hexToRgba(hex, 0.60),
      },
      badgeStyle: {
        backgroundColor: hex,
        color: badgeTextColor,
        borderColor: 'transparent',
        fontWeight: 800,
        boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
      },
      dotStyle: {
        backgroundColor: hex,
      },
    };
  }

  // Fallback a blue
  const fallback = COLOR_PRESETS[0];
  return {
    hex: fallback.hex,
    isHex: false,
    bg: fallback.bgClass,
    text: fallback.textClass,
    border: fallback.borderClass,
    badge: fallback.badgeClass,
    dot: fallback.dotClass,
    dotStyle: { backgroundColor: fallback.hex },
  };
}

export interface CategoryInfo {
  id: EventCategory;
  label: string;
  emoji: string;
  isCustom: boolean;
  defaultColor: string;
  Icon?: React.ComponentType<{ className?: string }>;
}

/**
 * Risolve etichetta, emoji e colore per qualsiasi categoria (standard o personalizzata)
 */
export function resolveCategoryInfo(
  catId: EventCategory,
  customCategories: CustomEventCategory[] = [],
  eventEmoji?: string
): CategoryInfo {
  // 1. Controlla prima tra le categorie personalizzate dell'utente
  const custom = customCategories.find((c) => c.id === catId);
  if (custom) {
    return {
      id: custom.id,
      label: custom.label,
      emoji: eventEmoji || custom.emoji || '📌',
      isCustom: true,
      defaultColor: custom.colore || 'purple',
    };
  }

  // 2. Controlla le categorie built-in
  const builtin = BUILTIN_CATEGORIES.find((b) => b.id === catId);
  if (builtin) {
    return {
      id: builtin.id,
      label: builtin.label,
      emoji: eventEmoji || builtin.defaultEmoji,
      isCustom: false,
      defaultColor: builtin.defaultColor,
      Icon: builtin.icon,
    };
  }

  // 3. Fallback per id categoria non standard
  return {
    id: catId,
    label: catId,
    emoji: eventEmoji || '📌',
    isCustom: true,
    defaultColor: 'slate',
  };
}
