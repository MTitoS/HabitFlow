import { MOTIVATIONAL_PHRASES, phraseForDate } from '@/config/motivationalPhrases';

describe('motivationalPhrases', () => {
  it('has exactly 49 phrases with text and author', () => {
    expect(MOTIVATIONAL_PHRASES).toHaveLength(49);
    for (const phrase of MOTIVATIONAL_PHRASES) {
      expect(phrase.text.trim().length).toBeGreaterThan(0);
      expect(phrase.author.trim().length).toBeGreaterThan(0);
    }
  });

  it('phraseForDate is stable for the same dateKey', () => {
    const first = phraseForDate('2026-05-06');
    const second = phraseForDate('2026-05-06');
    expect(first).toEqual(second);
  });

  it('different dateKeys can yield different phrases', () => {
    const indices = new Set(
      ['2026-05-06', '2026-05-07', '2026-05-08', '2026-05-09'].map((key) =>
        MOTIVATIONAL_PHRASES.indexOf(phraseForDate(key)),
      ),
    );
    expect(indices.size).toBeGreaterThan(1);
  });
});
