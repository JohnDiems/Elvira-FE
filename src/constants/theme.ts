/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1C221F',
    background: '#F4F6F5',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E8EFE9',
    textSecondary: '#727E78',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export const ElviraTheme = {
  primary: '#3A5340',      // Premium forest green
  primaryLight: '#E8EFE9', // Light green background card
  primaryDark: '#26372A',  // Dark green press state
  bgDark: '#F4F6F5',       // Light off-white/gray background
  bgCard: '#FFFFFF',       // Pure white card background
  border: '#E2E6E4',       // Subtle light gray-green border
  textLight: '#1C221F',    // Dark charcoal/slate text
  textMuted: '#727E78',    // Muted gray-green text
  accent: '#EAB308',       // Amber accent for warnings/top items
  red: '#EF4444',          // Danger/low stock highlight
  white: '#FFFFFF',
  black: '#000000',
};

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
