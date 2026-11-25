import { useWindowDimensions } from 'react-native';

import { MaxContentWidth, Spacing } from '@/constants/theme';

/** Website bento/grid breakpoints from `src/index.css`. */
export const BREAKPOINT = {
  phone: 480,
  bento: 760,
  tablet: 900,
} as const;

export function useLayout() {
  const { width, height } = useWindowDimensions();
  const isWide = width >= BREAKPOINT.bento;
  const isTablet = width >= BREAKPOINT.tablet;
  const gutter = isWide ? Spacing.five : Spacing.four;
  const contentWidth = Math.min(width, MaxContentWidth) - gutter * 2;

  const columns = (minWidth: number, maxCols?: number, gap: number = Spacing.three) => {
    const n = Math.max(1, Math.floor((contentWidth + gap) / (minWidth + gap)));
    return maxCols ? Math.min(maxCols, n) : n;
  };

  const tileWidth = (minWidth: number, gap: number = Spacing.three, maxCols?: number) => {
    const cols = columns(minWidth, maxCols, gap);
    return (contentWidth - gap * (cols - 1)) / cols;
  };

  /** Website `.grid`: 178 / 140 / 128 depending on width. */
  const caseMin = width <= BREAKPOINT.phone ? 128 : width <= BREAKPOINT.tablet ? 140 : 178;

  return { width, height, isWide, isTablet, gutter, contentWidth, columns, tileWidth, caseMin };
}
