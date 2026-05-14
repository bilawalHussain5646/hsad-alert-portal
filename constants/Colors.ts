/**
 * Premium Dark Theme Palette
 */

const tintColorLight = '#6366f1'; // Indigo 500
const tintColorDark = '#818cf8'; // Indigo 400

export const Colors = {
  light: {
    text: '#1f2937',
    background: '#f9fafb',
    tint: tintColorLight,
    tabIconDefault: '#9ca3af',
    tabIconSelected: tintColorLight,
    card: '#ffffff',
    cardLight: '#f3f4f6',
    border: '#e5e7eb',
    notification: '#ef4444',
    accent: tintColorLight,
    secondaryAcc: '#9333ea',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    surface: 'rgba(0, 0, 0, 0.05)',
  },
  dark: {
    text: '#f3f4f6',
    background: '#0a0a0c',
    tint: tintColorDark,
    tabIconDefault: '#6b7280',
    tabIconSelected: tintColorDark,
    card: '#16161e',
    cardLight: '#1f1f29',
    border: '#262633',
    notification: '#f87171',
    accent: tintColorDark,
    secondaryAcc: '#c084fc',
    success: '#34d399',
    error: '#fb7185',
    warning: '#fbbf24',
    surface: 'rgba(255, 255, 255, 0.05)',
  },
};

export default Colors;

