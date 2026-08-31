export type ComplianceSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface StyleViolation {
  id: string;
  type: 'FORBIDDEN_WORD' | 'TONE_MISMATCH' | 'READABILITY' | 'LENGTH' | 'LEGAL_RISK';
  severity: ComplianceSeverity;
  highlightedText?: string;
  message: string;
  suggestedReplacement?: string;
}

export interface BrandGuardianAuditResult {
  overallScore: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  isCompliant: boolean;
  toneAlignmentScore: number; // 0 - 100
  readingEaseScore: number; // Flesch-Kincaid 0 - 100
  readingGradeLevel: string; // e.g. "8th Grade"
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'URGENT';
  violations: StyleViolation[];
  suggestedCopy?: string;
  analysisSummary: string;
  auditedAt: string;
}

export interface AuditCopyInput {
  businessId: string;
  text: string;
  platform?: 'LINKEDIN' | 'TWITTER' | 'INSTAGRAM' | 'BLOG' | 'EMAIL';
  targetAudience?: string;
  desiredTone?: string;
}
