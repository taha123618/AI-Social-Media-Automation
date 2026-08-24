/**
 * Readability Analysis Utilities
 * Implements Flesch-Kincaid, Gunning Fog, and sentence/word metrics
 */

/**
 * Count syllables in a word using a simple heuristic
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;

  // Common silent-e patterns
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");

  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

/**
 * Split text into sentences
 */
function splitSentences(text: string): string[] {
  return text
    .replace(/<[^>]+>/g, "") // Strip HTML tags
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Split text into words
 */
function splitWords(text: string): string[] {
  return text
    .replace(/<[^>]+>/g, "")
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9'-]/g, ""))
    .filter((w) => w.length > 0);
}

/**
 * Calculate Flesch-Kincaid Reading Ease score
 * Higher scores = easier to read (0-100 scale)
 * 60-70 = Standard, 70-80 = Fairly Easy, 80-90 = Easy
 */
export function fleschKincaidReadingEase(text: string): number {
  const sentences = splitSentences(text);
  const words = splitWords(text);

  if (sentences.length === 0 || words.length === 0) return 0;

  const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = totalSyllables / words.length;

  const score = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;
  return Math.max(0, Math.min(100, Math.round(score * 10) / 10));
}

/**
 * Calculate Flesch-Kincaid Grade Level
 * Returns the US grade level needed to understand the text
 */
export function fleschKincaidGradeLevel(text: string): number {
  const sentences = splitSentences(text);
  const words = splitWords(text);

  if (sentences.length === 0 || words.length === 0) return 0;

  const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = totalSyllables / words.length;

  const grade = 0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59;
  return Math.max(0, Math.round(grade * 10) / 10);
}

/**
 * Calculate Gunning Fog Index
 * Estimates years of formal education needed to understand the text
 */
export function gunningFogIndex(text: string): number {
  const sentences = splitSentences(text);
  const words = splitWords(text);

  if (sentences.length === 0 || words.length === 0) return 0;

  const complexWords = words.filter((w) => countSyllables(w) >= 3).length;
  const avgSentenceLength = words.length / sentences.length;
  const complexWordPercent = (complexWords / words.length) * 100;

  const fog = 0.4 * (avgSentenceLength + complexWordPercent);
  return Math.max(0, Math.round(fog * 10) / 10);
}

/**
 * Full readability analysis
 */
export function analyzeReadability(text: string) {
  const sentences = splitSentences(text);
  const words = splitWords(text);

  const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);

  return {
    fleschKincaid: fleschKincaidReadingEase(text),
    gradeLevel: fleschKincaidGradeLevel(text),
    gunningFog: gunningFogIndex(text),
    avgSentenceLength: words.length / Math.max(sentences.length, 1),
    avgWordLength: words.reduce((sum, w) => sum + w.length, 0) / Math.max(words.length, 1),
    avgSyllablesPerWord: totalSyllables / Math.max(words.length, 1),
    sentenceCount: sentences.length,
    wordCount: words.length,
    paragraphCount: text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length,
  };
}

/**
 * Convert readability score to a 0-100 SEO score
 * Optimal blog readability: 60-70 Flesch-Kincaid
 */
export function readabilityToScore(fleschKincaid: number): number {
  if (fleschKincaid >= 60 && fleschKincaid <= 70) return 100; // Optimal
  if (fleschKincaid >= 50 && fleschKincaid < 60) return 85;
  if (fleschKincaid >= 70 && fleschKincaid <= 80) return 90;
  if (fleschKincaid >= 40 && fleschKincaid < 50) return 70;
  if (fleschKincaid >= 80 && fleschKincaid <= 90) return 75;
  if (fleschKincaid >= 30 && fleschKincaid < 40) return 55;
  if (fleschKincaid > 90) return 60;
  if (fleschKincaid < 30) return 40;
  return 50;
}
