import { useWindowDimensions } from 'react-native';

export const colors = {
  background: '#000000',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.55)',
  textFaint: 'rgba(255, 255, 255, 0.28)',
  hairline: 'rgba(255, 255, 255, 0.35)',
  /** The progress screen flips the palette: black on white. */
  inverse: {
    background: '#FFFFFF',
    text: '#000000',
    textSecondary: 'rgba(0, 0, 0, 0.55)',
    /** Empty part of the progress body. */
    ghost: 'rgba(0, 0, 0, 0.06)',
    outline: 'rgba(0, 0, 0, 0.35)',
  },
} as const;

const BASE_WIDTH = 390;

/** Scales a size relative to a ~390pt-wide phone, clamped so small and large screens stay balanced. */
export function useScale() {
  const { width, height } = useWindowDimensions();
  const factor = Math.min(Math.max(width / BASE_WIDTH, 0.82), 1.25);
  return {
    width,
    height,
    s: (size: number) => Math.round(size * factor),
    gutter: Math.round(Math.max(24, width * 0.09)),
  };
}

export const typography = {
  display: { fontSize: 34, lineHeight: 44, fontWeight: '300', letterSpacing: 0.2 },
  title: { fontSize: 26, lineHeight: 34, fontWeight: '300', letterSpacing: 0.2 },
  body: { fontSize: 18, lineHeight: 26, fontWeight: '300', letterSpacing: 0.3 },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '500', letterSpacing: 3.5 },
  timer: { fontSize: 56, lineHeight: 66, fontWeight: '200', letterSpacing: 2 },
} as const;

export type TypographyVariant = keyof typeof typography;
