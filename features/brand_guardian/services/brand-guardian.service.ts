import prisma from '@/lib/prisma';
import { AIService } from '@/services/ai/ai.service';
import { SystemLogger } from '@/features/system/services/logger.service';
import {
  AuditCopyInput,
  BrandGuardianAuditResult,
  StyleViolation,
} from '../types/brand-guardian.types';

export class BrandGuardianService {
  /**
   * Perform comprehensive real-time copy linting and brand voice audit
   */
  static async auditCopy(input: AuditCopyInput): Promise<BrandGuardianAuditResult> {
    const { businessId, text, platform = 'LINKEDIN', targetAudience, desiredTone } = input;

    if (!text || text.trim().length === 0) {
      return {
        overallScore: 100,
        grade: 'A+',
        isCompliant: true,
        toneAlignmentScore: 100,
        readingEaseScore: 100,
        readingGradeLevel: 'Standard',
        sentiment: 'NEUTRAL',
        violations: [],
        analysisSummary: 'No copy provided for audit.',
        auditedAt: new Date().toISOString(),
      };
    }

    // 1. Fetch brand profile & forbidden words from DB
    let brandTone = desiredTone || 'Authoritative, engaging, professional';
    let brandAudience = targetAudience || 'B2B Professionals and Founders';
    let forbiddenWords: string[] = [];

    try {
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: { profile: true, brandProfiles: true },
      });

      if (business) {
        const bp = business.brandProfiles?.[0];
        const prof = business.profile;
        brandTone = desiredTone || bp?.tone || prof?.tone || brandTone;
        brandAudience = targetAudience || (prof as any)?.targetAudience || (business as any)?.description || brandAudience;
        forbiddenWords = Array.isArray((prof as any)?.forbiddenWords) ? (prof as any).forbiddenWords : [];
      }
    } catch (err) {
      console.warn('[BRAND GUARDIAN] Error reading brand settings:', err);
    }

    // 2. Rule-Based Local Linting
    const violations: StyleViolation[] = [];

    // A. Check forbidden words
    const lowerText = text.toLowerCase();
    for (const word of forbiddenWords) {
      if (word && lowerText.includes(word.toLowerCase())) {
        violations.push({
          id: `viol_fword_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          type: 'FORBIDDEN_WORD',
          severity: 'HIGH',
          highlightedText: word,
          message: `Uses restricted brand term: "${word}"`,
          suggestedReplacement: 'Omit or replace with approved synonym',
        });
      }
    }

    // B. Calculate Flesch Reading Ease
    const { readingScore, gradeLevel } = BrandGuardianService.calculateReadability(text);
    if (readingScore < 45) {
      violations.push({
        id: `viol_read_${Date.now()}`,
        type: 'READABILITY',
        severity: 'MEDIUM',
        message: `Sentence structure is complex (${gradeLevel}). Break up long clauses for better engagement.`,
        suggestedReplacement: 'Use shorter punchy sentences under 15 words.',
      });
    }

    // C. Platform length checks
    if (platform === 'TWITTER' && text.length > 280) {
      violations.push({
        id: `viol_len_${Date.now()}`,
        type: 'LENGTH',
        severity: 'HIGH',
        message: `Copy exceeds X (Twitter) standard limit (${text.length}/280 chars).`,
        suggestedReplacement: 'Trim text or convert into a thread.',
      });
    }

    // 3. AI Tone & Sentiment Audit
    let toneScore = 88;
    let sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'URGENT' = 'POSITIVE';
    let suggestedCopy = text;
    let analysisSummary = 'Copy adheres well to brand guidelines with minor suggestions.';

    try {
      const prompt = `You are an elite Brand Guardian & Copy Editor for ${platform}.
Analyze the following text against these Brand Standards:
- Desired Tone: ${brandTone}
- Target Audience: ${brandAudience}

Copy to analyze:
"${text}"

Return ONLY valid JSON matching this schema:
{
  "toneAlignmentScore": 85,
  "sentiment": "POSITIVE",
  "analysisSummary": "Concise 1-2 sentence analysis of tone and engagement.",
  "additionalViolations": [
    {
      "type": "TONE_MISMATCH",
      "severity": "LOW",
      "highlightedText": "phrase",
      "message": "reason",
      "suggestedReplacement": "better phrasing"
    }
  ],
  "polishedCopy": "Optimized version of the copy adhering 100% to tone without forbidden jargon."
}`;

      const aiResponse = await AIService.generateResponse({
        messages: [
          { role: 'system', content: 'You are a brand compliance auditor that outputs pure JSON without markdown code fences.' },
          { role: 'user', content: prompt },
        ],
      });

      const responseContent = aiResponse.content || '';
      const cleaned = responseContent.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (typeof parsed.toneAlignmentScore === 'number') {
        toneScore = Math.min(100, Math.max(0, parsed.toneAlignmentScore));
      }
      if (parsed.sentiment) {
        sentiment = parsed.sentiment;
      }
      if (parsed.analysisSummary) {
        analysisSummary = parsed.analysisSummary;
      }
      if (parsed.polishedCopy) {
        suggestedCopy = parsed.polishedCopy;
      }
      if (Array.isArray(parsed.additionalViolations)) {
        for (const v of parsed.additionalViolations) {
          violations.push({
            id: `viol_ai_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            type: v.type || 'TONE_MISMATCH',
            severity: v.severity || 'LOW',
            highlightedText: v.highlightedText,
            message: v.message,
            suggestedReplacement: v.suggestedReplacement,
          });
        }
      }
    } catch (aiErr) {
      console.warn('[BRAND GUARDIAN] AI tone audit fallback triggered:', aiErr);
    }

    // 4. Calculate Final Composite Quality Score
    const violationDeductions = violations.reduce((acc, v) => {
      if (v.severity === 'CRITICAL') return acc + 30;
      if (v.severity === 'HIGH') return acc + 20;
      if (v.severity === 'MEDIUM') return acc + 10;
      return acc + 5;
    }, 0);

    const overallScore = Math.max(0, Math.min(100, Math.round(toneScore * 0.5 + readingScore * 0.2 + (100 - violationDeductions) * 0.3)));

    let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'A';
    if (overallScore >= 95) grade = 'A+';
    else if (overallScore >= 85) grade = 'A';
    else if (overallScore >= 75) grade = 'B';
    else if (overallScore >= 65) grade = 'C';
    else if (overallScore >= 50) grade = 'D';
    else grade = 'F';

    const result: BrandGuardianAuditResult = {
      overallScore,
      grade,
      isCompliant: overallScore >= 70 && !violations.some((v) => v.severity === 'CRITICAL' || v.severity === 'HIGH'),
      toneAlignmentScore: toneScore,
      readingEaseScore: Math.round(readingScore),
      readingGradeLevel: gradeLevel,
      sentiment,
      violations,
      suggestedCopy,
      analysisSummary,
      auditedAt: new Date().toISOString(),
    };

    await SystemLogger.logActivity({
      action: 'BRAND_GUARDIAN_AUDIT',
      entity: 'BrandGuardian',
      businessId,
      details: {
        overallScore: result.overallScore,
        grade: result.grade,
        violationCount: result.violations.length,
      },
    });

    return result;
  }

  /**
   * Helper to calculate Flesch-Kincaid reading ease score
   */
  static calculateReadability(text: string): { readingScore: number; gradeLevel: string } {
    const clean = text.trim();
    if (!clean) return { readingScore: 100, gradeLevel: 'Elementary' };

    const words = clean.split(/\s+/).filter(Boolean);
    const sentences = clean.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const numWords = Math.max(1, words.length);
    const numSentences = Math.max(1, sentences.length);

    // Approximate syllable count
    let totalSyllables = 0;
    for (const w of words) {
      totalSyllables += BrandGuardianService.countSyllables(w);
    }

    const wordsPerSentence = numWords / numSentences;
    const syllablesPerWord = totalSyllables / numWords;

    // Flesch Reading Ease formula
    const score = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;
    const clampedScore = Math.max(0, Math.min(100, score));

    let gradeLevel = '8th - 9th Grade (Conversational)';
    if (clampedScore >= 90) gradeLevel = '5th Grade (Very Easy)';
    else if (clampedScore >= 80) gradeLevel = '6th Grade (Easy)';
    else if (clampedScore >= 70) gradeLevel = '7th Grade (Fairly Easy)';
    else if (clampedScore >= 60) gradeLevel = '8th - 9th Grade (Standard)';
    else if (clampedScore >= 50) gradeLevel = '10th - 12th Grade (Fairly Difficult)';
    else if (clampedScore >= 30) gradeLevel = 'College Level (Difficult)';
    else gradeLevel = 'Academic / Graduate (Very Complex)';

    return {
      readingScore: clampedScore,
      gradeLevel,
    };
  }

  private static countSyllables(word: string): number {
    const w = word.toLowerCase().replace(/[^a-z]/g, '');
    if (w.length <= 3) return 1;
    const syllables = w.replace(/(?:[^laeiouy]|ed|es|e)$/, '').match(/[aeiouy]{1,2}/g);
    return syllables ? Math.max(1, syllables.length) : 1;
  }
}
