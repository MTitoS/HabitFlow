import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const MOBILE_MAX = 759;

export function classifyBreakpoint(width: number): Breakpoint {
  if (width >= 1024) return 'desktop';
  if (width > MOBILE_MAX) return 'tablet';
  return 'mobile';
}

export function useBreakpoint(): Breakpoint {
  const { width } = useWindowDimensions();
  return useMemo(() => classifyBreakpoint(width), [width]);
}

export function isDesktop(bp: Breakpoint): boolean {
  return bp === 'desktop';
}

export function isMobile(bp: Breakpoint): boolean {
  return bp === 'mobile';
}