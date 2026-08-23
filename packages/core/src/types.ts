/* ─────────────────────────────────────────────────────────────────────────────
   @ontosdk/core — shared types
   ─────────────────────────────────────────────────────────────────────────── */

export type AioGrade = 'Excellent' | 'Good' | 'Needs work' | 'AI-hostile' | 'Invisible';
export type HallucinationRisk = 'low' | 'medium' | 'high';

export interface ExtractionResult {
  markdown: string;
  metadata: {
    title: string;
    description: string;
    jsonLd: unknown[];
    language?: string;
    canonicalUrl?: string;
  };
  stats: {
    originalHtmlSize: number;
    markdownSize: number;
    tokenReductionRatio: number;
  };
}

export interface ScoringInsights {
  robots_allowed: boolean;
  waf_blocked: boolean;
  markdown_supported: boolean;
  json_ld_present: boolean;
  semantic_hierarchy: boolean;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  actionUrl?: string;
}

export interface ScoringResult {
  score: number;
  grade: AioGrade;
  url: string;
  metadata: {
    title: string;
    description: string;
  };
  penalties: string[];
  insights: ScoringInsights;
  benefits: string[];
  recommendations: Recommendation[];
  stats: {
    raw_size: string;
    htmlSize: string;
    textLength: number;
    efficiency: string;
  };
  botPreview: string;
  isUsingOntoSdk: boolean;
}

export interface ScoringInput {
  html: string;
  markdownPayload: string | null;
  targetUrl: string;
  robotsAllowed: boolean;
  isUsingOntoSdk?: boolean;
}
