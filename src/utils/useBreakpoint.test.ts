import { classifyBreakpoint } from '@/utils/useBreakpoint';

describe('useBreakpoint classification', () => {
  it('classifies mobile under 760', () => {
    expect(classifyBreakpoint(375)).toBe('mobile');
    expect(classifyBreakpoint(759)).toBe('mobile');
  });

  it('classifies tablet 760..1023', () => {
    expect(classifyBreakpoint(760)).toBe('tablet');
    expect(classifyBreakpoint(1023)).toBe('tablet');
  });

  it('classifies desktop >= 1024', () => {
    expect(classifyBreakpoint(1024)).toBe('desktop');
    expect(classifyBreakpoint(1440)).toBe('desktop');
  });
});